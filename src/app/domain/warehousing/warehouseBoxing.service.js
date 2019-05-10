(function () {

  angular.module('Warehousing')
    .service('WarehouseBoxing', WarehouseBoxing);

  function WarehouseBoxing(Schema, $q, SoundSynth, Language, $state) {

    const { WarehouseBox, WarehouseItem, Article } = Schema.models();
    const { PickingOrder, WarehouseItemOperation } = Schema.models();

    const NOCACHE = {
      bypassCache: true,
      cacheResponse: false,
      socketSource: 1,
      limit: 500,
    };

    let warehouseItem;

    return {

      findBoxById(id) {
        const cached = WarehouseBox.get(id);
        if (cached) {
          WarehouseBox.eject(id);
          return $q.resolve(cached);
        }
        return WarehouseBox.find(id, NOCACHE);
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

      findBoxItems(currentBoxId) {

        const cached = WarehouseItem.filter({ currentBoxId });

        if (cached.length) {
          _.each(cached, item => WarehouseItem.eject(item));
          return $q.resolve(cached);
        }

        return WarehouseItem.findAll({ currentBoxId }, NOCACHE)
          .then(items => {

            const byArticle = _.uniqBy(items, 'articleId');
            const unresolved = _.filter(byArticle, ({ article }) => !article);
            return Article.findByMany(_.map(unresolved, 'articleId'))
              .then(() => items);

          });
      },

      findBoxPickingOwner({ ownerXid: id }) {
        if (!id) {
          return $q.resolve(null);
        }
        return PickingOrder.find(id, NOCACHE);
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

      moveBoxToStock(warehouseBox, items) {

        warehouseBox.processing = 'stock';
        warehouseBox.ownerXid = null;

        return this.saveBoxWithItems(warehouseBox, items);

      },

      createBoxWithItems(barcode, warehouseItems) {

        const box = WarehouseBox.createInstance({
          barcode,
          processing: 'stock'
        });

        return this.saveBoxWithItems(box, warehouseItems);

      },

      saveBoxWithItems(warehouseBox, warehouseItems) {

        return warehouseBox.DSCreate()
          .then(() => WarehouseItemOperation.meta.createForOwner({
            ownerXid: null,
            warehouseBox,
            warehouseItems,
            source: 'BoxCreator',
          }))
          .then(() => warehouseBox);

      },

      /*
      Etc
       */

      goRootState() {
        $state.go('wh.warehouseBoxing');
      },

      goBoxInfo(box) {
        return this.goState('.view', { warehouseBoxId: box.id });
      },

      goState(name, params) {
        return $state.go(`wh.warehouseBoxing${name || ''}`, params);
      },

      clearCache() {
        WarehouseBox.ejectAll();
        WarehouseItem.ejectAll();
        WarehouseItemOperation.ejectAll();
      },

      pushWarehouseItem(item) {
        warehouseItem = item;
      },

      popWarehouseItem() {
        const res = warehouseItem;
        warehouseItem = null;
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

      replyBoxInfo(warehouseBox, items) {

        const pcs = items.length;
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

    };

  }


})();
