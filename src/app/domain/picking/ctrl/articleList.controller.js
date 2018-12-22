'use strict';

(function () {

  angular.module('webPage')
    .controller('ArticleListController', ArticleListController);

  const WAREHOUSE_BOX_SCAN_EVENT = 'warehouseBoxBarCodeScan';
  const WAREHOUSE_ITEM_SCAN_EVENT = 'warehouseItemBarCodeScan';
  const WAREHOUSE_PALETTE_SCAN_EVENT = 'warehousePaletteBarCodeScan';
  const STOCK_BATCH_SCAN_EVENT = 'stockBatchBarCodeScan';

  const PHRASE_PAUSE = 1000;

  function ArticleListController($scope, $filter, $state, toastr, Schema,
                                 $timeout, SoundSynth, Language, $q, ConfirmModal) {

    const {
      Article,
      PickingOrder,
      PickingOrderPosition,
      WarehouseBox,
      WarehouseItem,
      WarehousePalette,
    } = Schema.models();

    const orders = $scope.vm.pickingItems || $scope.vm.selectedItems;
    const { name: stateName } = $state.$current;

    let lockScanProcessor;

    const positions = PickingOrderPosition.filter({
      where: {
        pickingOrderId: { 'in': _.map(orders, 'id') }
      }
    });

    const vm = angular.extend(this, {

      articleIndex: _.groupBy(positions, 'articleId'),
      orders,
      pickedIndex: {},
      barCodeInput: '',
      title: '',
      scanned: {},
      lastBoxBarcode: '',

    });

    vm.articles = PickingOrderPosition.etc.pivotPositionsByArticle(vm.articleIndex);
    vm.currentFilter = stateName.match(/picked$/) ? { hasPicked: 'true' } : { isPicked: '!true' };
    vm.orderBy = stateName.match(/picked$/) ? '-ts' : 'article.name';

    $scope.$on('$stateChangeSuccess', onStateChange);

    $scope.$on(STOCK_BATCH_SCAN_EVENT, onStockBatchScan);
    $scope.$on(WAREHOUSE_BOX_SCAN_EVENT, onScan);
    $scope.$on(WAREHOUSE_ITEM_SCAN_EVENT, onScan);
    $scope.$on(WAREHOUSE_PALETTE_SCAN_EVENT, onScan);

    setGroups(vm.articles);

    /*
    Speaking
     */

    function replyNotFound() {
      SoundSynth.say('Неизвестный штрих-код');
    }

    function replyNotRequested() {
      SoundSynth.say('Этого товара нет в требовании');
    }

    function replyAlreadyPicked(ext) {
      SoundSynth.say(`Товар в заказе ${ext || ''}`);
    }

    function replyAlreadyPickedOrder(ownerXid) {
      PickingOrder.find(ownerXid, { cacheResponse: false })
        .then(found => replyAlreadyPicked(Language.speakableCount(found && found.ndoc)))
    }

    function replyEnoughOfThat() {
      SoundSynth.say('Этого больше не нужно');
    }

    function replyTakeAll(num, vol, packageRel) {
      const isFull = packageRel === vol;
      SoundSynth.say(`${isFull ? '' : 'неполная'} коробка ${num || ''}`);
    }

    function replyTakePalette(after) {
      SoundSynth.say(`Палета целиком ${after || ''}`);
    }

    function replyTaken(num) {
      SoundSynth.say(`Это ${Language.speakableCountFemale(num)}`);
    }

    function replyTakeSome(pcs, num) {
      replyTakeSomeBoxPcs({ pcs }, num);
    }

    function replyTakeSomeBoxPcs(boxPcs, num) {
      SoundSynth.say(`Забрать ${Language.speakableBoxPcs(boxPcs)} ${num}`);
    }

    function unloadSomeBoxPcs(boxPcs) {
      SoundSynth.say(`Нужно убрать с палеты ${Language.speakableBoxPcs(boxPcs)}`);
    }

    function replyLookAtScreen() {
      replySuccess('Вопрос на экране');
    }

    function repeatToConfirm() {
      SoundSynth.say('Повторите чтобы подтвердить');
    }

    function replyNotTheSameOrder() {
      SoundSynth.say('Эта коробка из другого заказа');
    }

    function replyError(text) {
      SoundSynth.say(text || 'Ошибка');
    }

    function replySuccess(text) {
      SoundSynth.say(text || 'Готово');
    }

    /*
    Scan handlers
     */

    function onScan(e, options) {

      console.info(e, options);

      if (lockScanProcessor) {
        console.warn('Ignore scan with lockScanProcessor');
        return;
      }

      lockScanProcessor = true;

      scanRouter(options)
        .finally(() => {
          lockScanProcessor = false;
        });

      function scanRouter({ code: barcode }) {
        switch (e.name) {
          case WAREHOUSE_BOX_SCAN_EVENT:
            return onWarehouseBoxScan(barcode);
          case WAREHOUSE_ITEM_SCAN_EVENT:
            return onWarehouseItemScan(barcode);
          case WAREHOUSE_PALETTE_SCAN_EVENT:
            return onWarehousePaletteScan(barcode);
          default:
            return $q.reject(new Error('unsupported scan event'));
        }
      }

    }

    function onWarehousePaletteScan(barcode) {
      return WarehousePalette.findAll({ barcode }, { cacheResponse: false })
        .then(res => {

          const found = _.first(res);

          return found ? onWarehousePalette(found) : replyNotFound();

        });
    }

    function onWarehouseBoxScan(barcode) {

      return WarehouseBox.findAll({ barcode }, { cacheResponse: false })
        .then(res => {

          const found = _.first(res);

          if (_.get(vm.scanned, 'items.length')) {
            const box = found || { barcode, processing: 'picked' };
            return onWarehouseBoxToPack(box);
          }

          return found ? onWarehouseBox(found) : replyNotFound();

        });
    }

    function onWarehouseItemScan(barcode) {
      return WarehouseItem.findAllWithRelations(
        { barcode },
        { cacheResponse: false })(['Article'])
        .then(res => res.length ? onWarehouseItem(res[0]) : replyNotFound());
    }


    /*
    Warehouse object processors
     */

    function reportPickedItemLocation(warehouseItem) {
      return warehouseItem.itemBox()
        .then(({ ownerXid }) => {
          replyAlreadyPickedOrder(ownerXid)
        })
        .catch(() => replyError());
    }

    function onWarehouseItem(warehouseItem) {

      if (warehouseItem.processing === 'picked') {
        // TODO: implement item removing from the picking order
        return reportPickedItemLocation(warehouseItem);
      }

      const toTake = findMatchingItems([warehouseItem]);

      if (!toTake) {
        return;
      }

      const { unpickedPos } = toTake;

      if (!unpickedPos) {
        return replyAlreadyPicked();
      }

      let { items, position } = vm.scanned;

      if (!position || position.id !== unpickedPos.id) {
        position = unpickedPos;
        items = [];
      }

      const scannedIndex = _.findIndex(items, warehouseItem) + 1;

      if (scannedIndex) {
        return replyTaken(scannedIndex);
      }

      if (items.length < unpickedPos.unPickedVolume()) {
        items.push(warehouseItem);
        vm.scanned = { position, items };
        replyTaken(items.length);
      }

      if (items.length === unpickedPos.unPickedVolume()) {
        replySuccess('Хватит этого теперь просканируйте коробку');
      }

    }

    function onWarehouseBoxToPack(box) {

      const { barcode } = box;
      const { position: unpickedPos, items } = vm.scanned;

      if (!unpickedPos || !items) {
        return replyError();
      }

      if (vm.lastBoxBarcode !== barcode) {
        repeatToConfirm();
        vm.lastBoxBarcode = barcode;
        return;
      }

      return $q.when(box.id ? box : WarehouseBox.create(box))
        .then(warehouseBox => {

          switch (warehouseBox.processing) {

            case 'picked': {
              // check if the same order as unpickedPos
              const { ownerXid } = warehouseBox;
              if (ownerXid && ownerXid !== unpickedPos.pickingOrderId) {
                return replyNotTheSameOrder();
              }
              return warehouseBox;
            }

            case 'draft':
            case 'stock': {
              return warehouseBox.boxItems()
                .then(boxItems => {
                  if (!boxItems.length) {
                    return warehouseBox;
                  } else {
                    const toReturn = _.filter(boxItems, boxHasItems);
                    if (toReturn.length) {
                      return returnItems(toReturn);
                    }
                    return $q.reject(new Error('Коробка не пустая'));
                  }
                });
            }

          }

        })
        .then(warehouseBox => {

          if (!warehouseBox) {
            return replyError();
          }

          return unpickedPos.linkPickedBoxItems(warehouseBox, items)
            .then(() => {
              updatePickedByPos(unpickedPos);
              vm.scanned = {};
              replySuccess(`Добавлено в заказ ${items.length}`);
            });

        })
        .catch(({ message }) => {
          replyError(message);
        });

      function boxHasItems(box) {
        return _.find(items, ({ id }) => id === box.id);
      }

      function returnItems(toReturnItems) {
        vm.scanned.items = _.remove(items, toReturnItems);
        const say = `Отмена ${Language.speakableCountFemale(toReturnItems.length)}`;
        return $q.reject(new Error(say));
      }

    }

    function updatePickedByPos(pickingOrderPosition) {

      const article = _.find(vm.articles, ({ positions }) => {
        return _.find(positions, ({ id }) => id === pickingOrderPosition.id);
      });

      if (article) {
        const res = article.updatePicked();
        setGroups(vm.articles);
        return res;
      }

    }

    function onWarehousePalette(palette) {

      if (palette.processing === 'picked') {
        return replyAlreadyPicked();
      }

      return palette.paletteItems()
        .then(boxedItems => {
          const articles = palette.paletteArticles(boxedItems);

          if (articles.length > 1) {
            return replyError('Сборные палеты пока нельзя');
          } else if (!articles.length) {
            return replyError('Палета пустая');
          }

          return matchingBoxes(palette, boxedItems, articles[0]);

        });

    }

    function matchingBoxes(palette, boxedItems, article) {

      const matchingArticles = _.filter(vm.articles, { sameId: article.sameId });

      if (!matchingArticles.length) {
        return replyNotRequested();
      }

      const unpicked = _.find(matchingArticles, a => {
        return a.totalUnPickedVolume > 0;
      });

      if (!unpicked) {
        return replyEnoughOfThat();
      }

      const paletteVol = _.sumBy(boxedItems, ({ items }) => items.length);

      const unpickedPos = _.find(unpicked.positions, pop => volumeToTake(pop) > 0);

      if (!unpickedPos) {
        return replyEnoughOfThat();
      }

      const toTakeVol = volumeToTake(unpickedPos);
      const num = orderNumber(unpickedPos);

      if (toTakeVol >= paletteVol) {

        replyTakePalette(num);

        replyLookAtScreen();

        const text = [
          `Добавить в заказ ${article.boxPcs(paletteVol, true).full}`,
          `на палете ${palette.barcode}?`].join(' ');

        return ConfirmModal.show({ text })
          .then(() => {

            const busy = unpickedPos.linkPickedPaletteBoxes(palette, boxedItems, onBoxProgress)
              .then(() => replySuccess('Готово'))
              .then(() => {
                updatePickedByPos(unpickedPos);
                if (!unpicked.totalUnPickedVolume) {
                  return $timeout(PHRASE_PAUSE)
                    .then(() => replyEnoughOfThat());
                }
              });

            vm.cgBusy = {
              promise: busy,
              message: 'Сохранение данных',
            };

            return busy;

            function onBoxProgress(boxNumber, totalBoxes) {
              vm.cgBusy.message = `Коробка ${boxNumber} из ${totalBoxes}`;
            }

          })
          .catch(_.noop);

      } else if (toTakeVol * 2 > paletteVol) {
        return unloadConfirm();
      } else {
        return replyTakeSomeBoxPcs(article.boxPcs(toTakeVol), num);
      }

      function volumeToTake(pop) {
        return _.min([pop.unPickedVolume(), paletteVol]);
      }

      function unloadConfirm() {

        const toTakeBoxPcs = article.boxPcs(paletteVol - toTakeVol);

        unloadSomeBoxPcs(toTakeBoxPcs);
        replyLookAtScreen();

        const text = `Убрать ${toTakeBoxPcs.full} с палеты ${palette.barcode}`;

        return ConfirmModal.show({ text })
          .then(() => {
            vm.paletteUnloading = { palette, boxes: [], toTakeBoxPcs };
            replySuccess('Сканируйте коробки');
            onWarehouseBoxUnloadingPalette();
          })
          .catch(_.noop);

      }

    }

    function onWarehouseBoxUnloadingPalette(box) {

      const { boxes, palette, toTakeBoxPcs } = vm.paletteUnloading || {};

      if (box) {
        if (box.currentPaletteId !== palette.id) {
          return replyError('Это коробка с другой палеты');
        }

        const taken = _.findIndex(boxes, ({ id }) => id === box.id) + 1;

        if (taken) {
          replyTaken(taken);
        } else {
          boxes.push(box);
          replyTaken(boxes.length);
        }
      }

      if (vm.paletteUnloading.modal) {
        vm.paletteUnloading.modal.cancel();
      }

      const buttons = [
        {
          title: 'Закочить и сохранить',
          id: 'yes',
          type: 'submit'
        },
        {
          title: 'Отмена',
          id: 'cancel',
          type: 'cancel'
        }
      ];

      ConfirmModal.show({
        text: `Снято ${boxes.length} коробок из ${toTakeBoxPcs.box}, закончить?`,
        resolve,
        buttons,
      })
        .then(() => {
          const promise = palette.unloadBoxes(vm.paletteUnloading.boxes)
            .then(() => {
              vm.paletteUnloading = false;
              replySuccess();
            })
            .catch(() => replyError());
          vm.cgBusy = {
            promise,
            message: 'Сохранение данных',
          };
        })
        .catch(buttonId => {
          if (buttonId === 'cancel') {
            vm.paletteUnloading = false;
          }
        })
        .finally(() => {
          delete vm.paletteUnloading.modal;
        });

      function resolve(modal) {
        vm.paletteUnloading.modal = modal;
      }

    }

    function onWarehouseBox(box) {

      if (vm.paletteUnloading) {

        return onWarehouseBoxUnloadingPalette(box);

      }

      if (box.processing === 'picked') {

        const orderWithBox = _.find(orders, ({ id }) => id === box.ownerXid);

        if (!orderWithBox) {
          return replyAlreadyPickedOrder(box.ownerXid);
        }

        const boxPositions = orderWithBox.boxPositions(box);

        if (boxPositions.length > 1) {
          return replyAlreadyPicked();
        } else if (!boxPositions.length) {
          return replyError('Коробка в заказе с ошибкой');
        }

        const position = boxPositions[0];
        const { Article: article } = position;
        const unPickedVolume = position.unPickedVolume();

        if (!unPickedVolume) {
          return replyEnoughOfThat();
        }

        const reply = article.boxPcs(unPickedVolume);

        return replyError(`Еще нужно ${Language.speakableBoxPcs(reply)}`);

      }

      return box.boxItems()
        .then(items => {
          if (!items.length) {
            replyError('Пустая коробка');
            return;
          }
          return findMatchingItems(items, box);
        });
    }

    function findMatchingItems(warehouseItems, box) {
      // console.log(_.map(warehouseItems, 'article'));

      const matching = _.filter(warehouseItems, ({ article }) => {
        return !article || _.find(vm.articles, { sameId: article.sameId });
      });

      if (!matching.length) {
        return replyNotRequested();
      }

      const unpicked = _.find(vm.articles, a => {
        return a.totalUnPickedVolume > 0 && _.find(matching, ({ article }) => {
          return a.sameId === article.sameId;
        });
      });

      if (!unpicked) {
        return replyEnoughOfThat();
      }

      const { sameId } = unpicked;

      const unpickedItems = _.filter(matching, ({ article }) => article.sameId === sameId);

      const unpickedPos = _.find(unpicked.positions, pop => volumeToTake(pop) > 0);

      if (!unpickedPos) {
        return replyEnoughOfThat();
      }

      if (unpickedPos.target === 'strict') {
        return replyError(`Новые марки запрещены в этом заказе`);
      }

      const toTakeVol = volumeToTake(unpickedPos);

      const num = orderNumber(unpickedPos);

      if (toTakeVol >= warehouseItems.length) {

        if (!box) {
          return { toTakeVol, unpickedPos, num };
        }

        replyTakeAll(num, warehouseItems.length, _.first(warehouseItems).article.packageRel);

        return unpickedPos.linkPickedBoxItems(box, warehouseItems)
          .then(() => {
            updatePickedByPos(unpickedPos);
            if (!unpicked.totalUnPickedVolume) {
              return $timeout(PHRASE_PAUSE)
                .then(() => replyEnoughOfThat());
            }
          });

      }

      return replyTakeSome(toTakeVol, num);

      function volumeToTake(pop) {
        return _.min([pop.unPickedVolume(), unpickedItems.length]);
      }

    }

    function orderNumber(unpickedPos) {

      const { orders } = $scope.vm;
      const orderNum = orders.indexOf(unpickedPos.PickingOrder) + 1;

      return orders.length > 1
        ? (orderNum === 2 ? ' во ' : ' в ') + Language.orderRu(orderNum) : '';

    }

    function onStockBatchScan(e, options) {

      if (lockScanProcessor) {
        return;
      }

      lockScanProcessor = true;

      Article.find(options.stockBatch.articleId)
        .then(() => {
          $timeout(processorFn, 10);
        })
        .catch(() => {
          lockScanProcessor = false;
        });

      function processorFn() {

        const found = options.stockBatch.Article &&
          processArticle(options.stockBatch.Article, options.stockBatch, options.code);

        if (found && found.id) {
          toastr.success(found.name, found.volume);
          if (found.speakable) {
            SoundSynth.say(found.speakable);
          }
        } else {
          replyNotRequested();
        }

        lockScanProcessor = false;

      }

    }

    function onStateChange(e, to, toParams, from, fromParams) {

      vm.mode = to.name.match(/[^.]*$/)[0];

      vm.title = (vm.mode === 'picked' && 'Собранные товары')
        || (vm.mode === 'articleList' && 'Товары для сборки');

      if (fromParams.id) {
        const article = _.find(vm.articles, { id: fromParams.id });
        if (article) {
          article.updatePicked();
        }
      }

      if (/^(picked|articleList)$/.test(vm.mode)) {
        setGroups(vm.articles);
      }

    }

    function setGroups(articlesArray) {

      const filtered = $filter('filter')(articlesArray, vm.currentFilter);

      if (vm.mode === 'picked') {

        vm.groups = [];

        if (filtered.length) {
          vm.groups.push({
            name: '',
            articles: filtered
          });
        }

      } else if (vm.mode === 'articleList') {

        vm.groups = _.map(
          _.groupBy(filtered, 'article.category'),
          (val, key) => {
            return { name: key, articles: val };
          }
        );

      }

    }

    function processArticle(a, sb, code) {

      const pas = _.filter(vm.articles, { sameId: a.sameId });

      if (!pas.length) {
        return;
      }

      let totalUnpicked = 0;
      let pa = _.find(pas, p => {
        totalUnpicked += p.totalUnPickedVolume;
        return totalUnpicked > 0;
      });

      let pickablePositions = [];
      let maxVolume = _.result(sb, 'spareVolume') || 0;

      function respondToSay(say, pickedVolume) {
        if (!say && !totalUnpicked) {
          say = 'Товар уже собран';
        } else if (!say) {
          say = 'В этой партии уже нет товара';
        }

        if (totalUnpicked) {
          say += '.  Требуется товар из другой партии';
        }

        return {
          id: a.id,
          name: a.name,
          speakable: _.trim(say),
          volume: pickedVolume
            ? a.boxPcs(pickedVolume, true).full
            : say
        };
      }

      if (!pa) {
        return respondToSay();
      }

      vm.pickedIndex [pa.id] = true;

      _.each(pa.positions, pop => {

        const unp = _.min([pop.unPickedVolume(), maxVolume]);

        maxVolume -= unp;
        totalUnpicked -= unp;

        if (unp > 0) {
          pickablePositions.push({
            pop: pop,
            unp: unp,
            num: $scope.vm.orders.indexOf(pop.PickingOrder) + 1,
            // TODO: check packageRels
            volume: Language.speakableBoxPcs(a.boxPcs(unp, true))
          });
        }

      });

      pickablePositions = _.orderBy(pickablePositions, 'num');

      if (vm.mode === 'article') {
        pickablePositions = _.take(pickablePositions);
      }

      let qs = [];

      const pickedVolume = _.reduce(pickablePositions, (res, pp) => {
        qs.push(pp.pop.linkStockBatch(sb, code, pp.unp));
        return res + pp.unp;
      }, 0);

      if (pickedVolume) {
        $q.all(qs).then(() => {
          pa.updatePicked();
          setGroups(vm.articles);
        })
      }

      const say = _.reduce(pickablePositions, (res, pp, idx) => {
        return res
          + (idx ? ', плюс ' : '')
          + pp.volume
          + ($scope.vm.orders.length > 1
              ? (pp.num === 2 ? ' во ' : ' в ')
              + Language.orderRu(pp.num)
              : ''
          );
      }, '');

      return respondToSay(say, pickedVolume);

    }


  }

})();
