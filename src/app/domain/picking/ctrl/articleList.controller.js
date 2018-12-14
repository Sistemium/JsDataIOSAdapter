'use strict';

(function () {

  angular.module('webPage')
    .controller('ArticleListController', ArticleListController);

  const WAREHOUSE_BOX_SCAN_EVENT = 'warehouseBoxBarCodeScan';
  const WAREHOUSE_ITEM_SCAN_EVENT = 'warehouseItemBarCodeScan';
  const STOCK_BATCH_SCAN_EVENT = 'stockBatchBarCodeScan';

  function ArticleListController($scope, $filter, $state, toastr, Schema,
                                 $timeout, SoundSynth, Language, $q) {

    const {
      Article,
      PickingOrderPosition,
      WarehouseBox,
      WarehouseItem,
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
    $scope.$on(WAREHOUSE_BOX_SCAN_EVENT, onWarehouseBoxScan);
    $scope.$on(WAREHOUSE_ITEM_SCAN_EVENT, onWarehouseItemScan);

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

    function replyAlreadyPicked() {
      SoundSynth.say('Товар уже в заказе');
    }

    function replyEnoughOfThat() {
      SoundSynth.say('Этого больше не нужно');
    }

    function replyTakeAll(num, after) {
      SoundSynth.say(`${num || 'Бери'} ${after || ''}`);
    }

    function replyTaken(num) {
      SoundSynth.say(`Это номер ${num}`);
    }

    function replyTakeSome(pcs, num) {
      SoundSynth.say(`Забрать ${Language.speakableBoxPcs({ pcs })} ${num}`);
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
    Functions
     */

    function onWarehouseBoxScan(e, options) {
      // console.info(options);

      if (lockScanProcessor) {
        console.warn('Ignore scan with lockScanProcessor');
        return;
      }

      lockScanProcessor = true;

      const { code: barcode } = options;

      WarehouseBox.findAll({ barcode }, { cacheResponse: false })
        .then(res => {

          const found = _.first(res);

          if (_.get(vm.scanned, 'items.length')) {
            const box = found || { barcode, processing: 'picked' };
            return onWarehouseBoxToPack(box);
          }

          return found ? onWarehouseBox(found) : replyNotFound;

        })
        .finally(() => {
          lockScanProcessor = false;
        });
    }

    function onWarehouseItemScan(e, options) {
      // console.info(options);

      if (lockScanProcessor) {
        console.warn('Ignore scan with lockScanProcessor');
        return;
      }

      lockScanProcessor = true;

      const { code: barcode } = options;

      WarehouseItem.findAllWithRelations(
        { barcode },
        { cacheResponse: false })(['Article'])
        .then(res => res.length ? onWarehouseItem(res[0]) : replyNotFound)
        .finally(() => {
          lockScanProcessor = false;
        });
    }

    function onWarehouseItem(warehouseItem) {

      if (warehouseItem.processing === 'picked') {
        // TODO: implement item removing from the picking order
        return replyAlreadyPicked();
      }

      const toTake = findMatchingItems([warehouseItem]);

      if (!toTake || !toTake.unpickedPos) {
        return;
      }

      let { items, position } = vm.scanned;

      if (!position || position.id !== toTake.unpickedPos.id) {
        position = toTake.unpickedPos;
        items = [];
      }

      const scannedIndex = _.findIndex(items, warehouseItem) + 1;

      if (scannedIndex) {
        return replyTaken(scannedIndex);
      }

      items.push(warehouseItem);

      vm.scanned = { position, items };

      replyTaken(items.length);

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
          // .then(() => replyTakeAll(orderNumber(unpickedPos)))
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
        article.updatePicked();
        setGroups(vm.articles);
      }

    }

    function onWarehouseBox(box) {

      if (box.processing === 'picked') {

        const orderWithBox = _.find(orders, ({ id }) => id === box.ownerXid);

        if (!orderWithBox) {
          return replyAlreadyPicked();
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

        return replyError(`В заказ еще нужно ${Language.speakableBoxPcs(reply)}`);

      }

      return box.boxItems()
        .then(items => findMatchingItems(items, box));
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

      const toTakeVol = volumeToTake(unpickedPos);

      const num = orderNumber(unpickedPos);

      if (toTakeVol >= warehouseItems.length) {

        if (!box) {
          return { toTakeVol, unpickedPos, num };
        }

        return unpickedPos.linkPickedBoxItems(box, warehouseItems)
          .then(() => replyTakeAll(num))
          .then(() => {
            updatePickedByPos(unpickedPos);
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
