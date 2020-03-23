(function () {

  angular.module('Warehousing')
    .service('WarehouseBoxing', WarehouseBoxing);

  function WarehouseBoxing(Schema, $q, SoundSynth, Language, $state, Picking) {

    const { WarehouseBox, WarehouseItem, WarehousePalette } = Schema.models();
    const { PickingOrder, WarehouseItemOperation, Article } = Schema.models();
    const { PickingOrderPosition, PickingOrderPositionPicked } = Schema.models();
    const { WarehouseBoxConfirmed, WarehousePaletteConfirmed } = Schema.models();

    const NOCACHE = {
      bypassCache: true,
      cacheResponse: false,
      socketSource: 1,
      limit: 500,
    };

    let warehouseItem;
    let plainStamp;
    let stockBatchScanned;

    return {

      OLD_STAMP_LENGTH: 68,

      confirmPalette(palette) {
        return WarehousePaletteConfirmed.create(palette, NOCACHE);
      },

      confirmBox(box) {
        return WarehouseBoxConfirmed.create(box, NOCACHE);
      },

      findPaletteById(id) {
        return WarehousePalette.find(id, NOCACHE);
      },

      findBoxById(id) {
        const cached = WarehouseBox.get(id);
        if (cached) {
          WarehouseBox.eject(id);
          return $q.resolve(cached);
        }
        return WarehouseBox.find(id, NOCACHE);
      },

      findStockBatchByBarcode(barcode) {
        return Picking.stockBatchByBarCode(barcode)
          .then(sb => {
            if (!sb) {
              return null;
            }
            const { articleId } = sb;
            if (!articleId) {
              return this.replyNoArticle();
            }
            return this.findArticle(articleId)
              .then(article => {
                if (!article) {
                  return this.replyNoArticle();
                }
                return { articleId, barcode, article };
              });
          });
      },

      findArticle(articleId) {
        const a = Article.get(articleId);
        return a ? $q.resolve(a) : Article.find(articleId);
      },

      findPaletteByBarcode(barcode) {
        return WarehousePalette.findAll({ barcode }, NOCACHE)
          .then(_.first)
          .then(palette => {
            if (palette) {
              WarehousePalette.inject(palette);
            }
            return palette;
          });
      },

      findBoxByBarcode(barcode) {
        return WarehouseBox.findAll({ barcode }, NOCACHE)
          .then(_.first)
          .then(box => {
            if (box) {
              WarehouseBox.inject(box);
            }
            return box;
          });
      },

      findItemByBarcode(barcode) {
        return WarehouseItem.findAllWithRelations({ barcode }, NOCACHE)('Article')
          .then(_.first);
      },

      lastConfirmedBox({ barcode }) {
        return WarehouseBoxConfirmed.findAll({ barcode }, NOCACHE)
          .then(confirmations => {
            return _.last(_.orderBy(confirmations, 'deviceCts'));
          })
          .then(confirmed => {
            if (!confirmed) {
              return null;
            }
            const { articleId } = confirmed;
            if (!articleId) {
              return confirmed;
            }
            return this.findArticle(articleId)
              .then(() => confirmed);
          });
      },

      lastConfirmedPalette({ barcode }) {
        return WarehousePaletteConfirmed.findAll({ barcode }, NOCACHE)
          .then(confirmations => {
            return _.last(_.orderBy(confirmations, 'deviceCts'));
          });
      },

      findPaletteItems(warehouseBoxIds) {

        const options = _.assign({ field: 'currentBoxId' }, NOCACHE);

        return WarehouseItem.findByMany(warehouseBoxIds, options)
          .then(this.resolveItemsArticles);

      },

      findBoxItems(currentBoxId) {

        const cached = WarehouseItem.filter({ currentBoxId });

        if (cached.length) {
          _.each(cached, item => WarehouseItem.eject(item));
          return $q.resolve(cached);
        }

        return WarehouseItem.findAll({ currentBoxId }, NOCACHE)
          .then(this.resolveItemsArticles);

      },

      resolveItemsArticles(items) {

        const byArticle = _.uniqBy(items, 'articleId');
        const unresolved = _.filter(byArticle, ({ article }) => !article);
        return Article.findByMany(_.map(unresolved, 'articleId'))
          .then(() => items);

      },

      findBoxPickingOwner({ ownerXid: id }) {
        if (!id) {
          return $q.resolve(null);
        }
        return PickingOrder.find(id, NOCACHE);
      },

      findBoxOrders(warehouseBox) {
        const { id: warehouseBoxId } = warehouseBox;
        if (!warehouseBoxId) {
          return $q.resolve([]);
        }
        return PickingOrderPositionPicked.findAll({ warehouseBoxId }, NOCACHE)
          .then(picked => {
            const ids = _.map(picked, 'pickingOrderPositionId');
            return PickingOrderPosition.findByMany(ids, NOCACHE);
          })
          .then(positions => {
            const ids = _.map(positions, 'pickingOrderId');
            return PickingOrder.findByMany(ids, NOCACHE);
          });
      },

      removeItemsFromBox(warehouseBox, items) {

        const moveItems = _.map(items, warehouseItem => {
          _.assign(warehouseItem, {
            currentBoxId: null,
          });
          return warehouseItem.DSCreate();
        });

        return $q.all(moveItems)

      },

      moveBoxToStock(warehouseBox, items, processing = 'stock') {

        warehouseBox.processing = processing;

        if (processing === 'stock') {
          warehouseBox.ownerXid = null;
        }

        return this.saveBoxWithItems(warehouseBox, items);

      },

      createBoxWithItems(barcode, warehouseItems) {

        const box = WarehouseBox.createInstance({
          barcode,
          processing: 'stock',
          ownerXid: null,
        });

        return this.saveBoxWithItems(box, warehouseItems);

      },

      saveBoxWithItems(warehouseBox, warehouseItems) {

        return warehouseBox.DSCreate()
          .then(wb => WarehouseItemOperation.meta.createForOwner({
            ownerXid: wb.ownerXid,
            warehouseBox: wb,
            warehouseItems,
            source: 'BoxCreator',
          })
            .then(items => {
              WarehouseItem.inject(items);
              return wb;
            }));

      },

      /*
      Etc
       */

      goRootState() {
        $state.go('wh.warehouseBoxing');
      },

      goConfirmedBoxInfo() {
        this.goRootState();
      },

      goBoxInfo(box) {
        return this.goState('.view', { warehouseBoxId: box.id });
      },

      goPaletteInfo(palette) {
        return this.goState('.palette', { warehousePaletteId: palette.id });
      },

      goState(name, params) {
        return $state.go(`wh.warehouseBoxing${name || ''}`, params);
      },

      clearCache() {
        WarehouseBox.ejectAll();
        WarehouseItem.ejectAll();
        WarehouseItemOperation.ejectAll();
        WarehousePalette.ejectAll();
      },

      pushWarehouseItem(item) {
        warehouseItem = item;
      },

      pushStockBatch(stockBatch) {
        stockBatchScanned = stockBatch;
      },

      pushPlainStamp(barcode) {
        plainStamp = barcode;
      },

      popWarehouseItem() {
        const res = warehouseItem;
        warehouseItem = null;
        return res;
      },

      popPlainStamp() {
        const res = plainStamp;
        plainStamp = null;
        return res;
      },

      popStockBatch() {
        const res = stockBatchScanned;
        stockBatchScanned = null;
        return res;
      },

      /*
      Sounds
       */

      replyNoBox() {
        SoundSynth.say('Эта марка без коробки');
      },

      replyNewBox() {
        SoundSynth.say('Новая коробка');
      },

      replyNotFound() {
        SoundSynth.say('Неизвестный штрих-код');
      },

      replyInvalidType() {
        SoundSynth.say('Неизвестный тип штрих-кода');
      },

      replyNotTheSameArticle() {
        SoundSynth.say('Это другой товар');
      },

      replyPaletteInfo(warehousePalette, boxes) {
        const box = boxes.length;
        const texts = [
          // byArticle.length > 1 ? 'Сборная ' : '',
          `Палета ${_.lowerCase(warehousePalette.statusLabel())} `,
          box ? `${Language.speakableBoxPcs({ box })}` : 'пустая',
        ];

        SoundSynth.say(texts.join(''));
      },

      replyBoxInfo(warehouseBox, items, stamps) {

        const pcs = items.length || stamps.length;
        const byArticle = _.uniqBy(items, 'articleId');

        const texts = [
          byArticle.length > 1 ? 'Сборная ' : '',
          `коробка ${_.lowerCase(warehouseBox.statusLabel())} `,
          pcs ? `${Language.speakableBoxPcs({ pcs })}` : 'пустая',
        ];

        SoundSynth.say(texts.join(''));

      },

      replyNotConnected() {
        SoundSynth.say('Ошибка связи');
      },

      replyBusy() {
        SoundSynth.say('Подождите');
      },

      replyDone() {
        SoundSynth.say('Готово');
      },

      replyItemScan(num) {
        SoundSynth.say(`Это ${Language.speakableCountFemale(num)}`);
      },

      replyItemAgain(num) {
        SoundSynth.say(`Это снова ${Language.speakableCountFemale(num)}`);
      },

      replyError(text) {
        SoundSynth.say(text || 'Ошибка');
      },

      replyNoArticle() {
        SoundSynth.say('Не найдена номенклатура партии');
      },

    };

  }


})();
