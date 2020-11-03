(function () {

  angular.module('Warehousing')
    .service('Picking', Picking);

  function Picking(Schema, $q, SoundSynth, Language) {

    const {
      // Article,
      PickingOrder,
      // PickingOrderPosition,
      WarehouseBox,
      WarehouseItem,
      WarehousePalette,
      StockBatch,
      StockBatchBarCode,
      BarCodeType,
    } = Schema.models();

    const GNI_CODES_ALLOW_STOCK_BATCH = [261, 262, 263, 500, 510, 520, 260];

    const NOCACHE = {
      bypassCache: true,
      cacheResponse: false,
      // socketSource: 1,
      // limit: 500,
    };

    const NOCACHE_SOCKET = {
      bypassCache: true,
      cacheResponse: false,
      socketSource: 1,
      // limit: 500,
    };

    const {
      BARCODE_TYPE_STOCK_BATCH,
      BARCODE_TYPE_WAREHOUSE_BOX,
      BARCODE_TYPE_EXCISE_STAMP,
      BARCODE_TYPE_WAREHOUSE_PALETTE,
    } = BarCodeType.meta.types;


    const paletteRe = /\d{12}[24]\d{13}/;
    const codabarRe = /[ABCD](\d{18})[ABCD]/i;

    return {

      isArticleAllowedStockBatch({ gniCode }) {
        return GNI_CODES_ALLOW_STOCK_BATCH.includes(gniCode);
      },

      codabarFix(code) {

        const fixed = code.match(codabarRe);

        if (fixed) {
          return fixed[1];
        }

        return code;

      },

      scanType(code) {

        const { length } = code;

        if (length === 8) {
          return BARCODE_TYPE_STOCK_BATCH;
        } else if (length === 18) {
          return BARCODE_TYPE_WAREHOUSE_PALETTE;
        } else if (length === 26) {
          if (paletteRe.test(code)) {
            return BARCODE_TYPE_WAREHOUSE_PALETTE;
          }
          return BARCODE_TYPE_WAREHOUSE_BOX;
        } else if (length === 150 || length === 68) {
          return BARCODE_TYPE_EXCISE_STAMP;
        }

        return undefined;

      },

      stockBatchByBarCode(code) {

        const options = _.assign({ limit: 1 }, NOCACHE_SOCKET);

        return StockBatchBarCode.findAll({ code }, options)
          .then(_.first)
          .then(item => item && StockBatch.find(item.stockBatchId, NOCACHE_SOCKET));

      },

      boxItems(box) {
        return WarehouseItem.findAllWithRelations(
          { currentBoxId: box.id }, NOCACHE_SOCKET)(['Article'])
      },

      createWarehouseBox(box) {
        return WarehouseBox.create(box);
      },

      warehouseBoxByBarcode(barcode) {
        return WarehouseBox.findAll({ barcode }, NOCACHE_SOCKET)
          .then(_.first);
      },

      warehousePaletteByBarcode(barcode) {
        return WarehousePalette.findAll({ barcode }, NOCACHE_SOCKET)
          .then(_.first);
      },

      warehouseItemByBarcode(barcode) {
        return WarehouseItem.findAllWithRelations(
          { barcode }, NOCACHE_SOCKET)('Article')
          .then(_.first);
      },

      palettesByOrder(pickingOrder) {
        return WarehousePalette.findAll({ ownerXid: pickingOrder.id }, NOCACHE)
          .then(res => _.orderBy(res, 'barcode'));
      },

      boxesByOrder(pickingOrder) {
        return WarehouseBox.findAll({ ownerXid: pickingOrder.id }, NOCACHE)
          .then(res => _.orderBy(res, 'barcode'));
      },

      boxesByOrders(ordersArray) {

        const palettes = _.map(ordersArray, order => this.palettesByOrder(order));
        const boxes = _.map(ordersArray, order => this.boxesByOrder(order));

        return $q.all([
          $q.all(boxes),
          $q.all(palettes),
        ]);

      },

      boxedItems(boxesArray) {

        // const ids
        // return WarehouseItem.groupBy({}['currentBoxId'])

        const chunks = _.chunk(_.map(boxesArray, 'id'), 20);

        return $q.all(_.map(chunks, currentBoxId => {
          return WarehouseItem.groupBy({ currentBoxId }, ['currentBoxId'])
        }))
          .then(arrayOfGroups => _.flatten(arrayOfGroups))
          .then(groups => {
            const boxesById = _.keyBy(boxesArray, 'id');
            return _.map(groups, ({ currentBoxId, "count()": itemsCount }) => {
              const { barcode } = boxesById[currentBoxId];
              return { id: currentBoxId, itemsCount, barcode };
            });
          });

      },

      createPaletteInOrder(barcode, pickingOrder) {

        const palette = {
          barcode,
          ownerXid: pickingOrder.id,
          processing: 'picked',
        };

        return WarehousePalette.create(palette);

      },

      /*
      Speaking
       */

      say(speech) {
        SoundSynth.say(speech);
      },

      replyNotAllowedStockBatch() {
        SoundSynth.say('Этот товар можно собирать только по маркам');
      },

      replyNotFound(of = '') {
        SoundSynth.say(`Неизвестный штрих-код ${of}`);
      },

      replyNotRequested() {
        SoundSynth.say('Этого товара нет в требовании');
      },

      replyAlreadyPicked(ext) {
        SoundSynth.say(`Товар в заказе ${ext || ''}`);
      },

      replyAlreadyPickedOrder(ownerXid) {
        return PickingOrder.find(ownerXid, { cacheResponse: false })
          .then(found => {
            this.replyAlreadyPicked(Language.speakableCount(found.ndoc));
          })
          .catch(() => {
            this.replyAlreadyPicked('с неизвестным номером');
          });
      },

      replyEnoughOfThat() {
        SoundSynth.say('Этого больше не нужно');
      },

      replyTakeAll(num, vol, packageRel) {
        const isFull = packageRel === vol;
        SoundSynth.say(`${isFull ? '' : 'неполная'} коробка ${num || ''}`);
      },

      replyTakePalette(after) {
        SoundSynth.say(`Палета целиком ${after || ''}`);
      },

      replyTaken(num, ord) {
        SoundSynth.say(`Это ${Language.speakableCountFemale(num)} ${ord || ''}`);
      },

      replyTakeSome(pcs, num) {
        this.replyTakeSomeBoxPcs({ pcs }, num);
      },

      replyTakeSomeBoxPcs(boxPcs, num) {
        SoundSynth.say(`Забрать ${Language.speakableBoxPcs(boxPcs)} ${num}`);
      },

      unloadSomeBoxPcs(boxPcs) {
        SoundSynth.say(`Нужно убрать с палеты ${Language.speakableBoxPcs(boxPcs)}`);
      },

      replyLookAtScreen() {
        this.replySuccess('Вопрос на экране');
      },

      repeatToConfirm() {
        SoundSynth.say('Повторите чтобы подтвердить');
      },

      replyNotTheSameOrder() {
        SoundSynth.say('Эта коробка из другого заказа');
      },

      replyError(text) {
        SoundSynth.say(text || 'Ошибка');
      },

      replySuccess(text) {
        SoundSynth.say(text || 'Готово');
      },

    };

  }

})();
