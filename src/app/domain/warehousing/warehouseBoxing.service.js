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

      moveBoxToStock(warehouseBox, items) {

        warehouseBox.processing = 'stock';
        warehouseBox.ownerXid = null;

        const moveItems = _.map(items, warehouseItem => {
          warehouseItem.processing = 'stock';
          return warehouseItem.DSCreate();
        });

        return $q.all(moveItems)
          .then(() => warehouseBox.DSCreate());

      },

      createBoxWithItems(barcode, warehouseItems) {

        return WarehouseBox.create({ barcode, processing: 'stock' })
          .then(warehouseBox => {
            return WarehouseItemOperation.meta.createForOwner({
              ownerXid: null,
              warehouseBox,
              warehouseItems,
              source: 'BoxCreator',
            })
              .then(operations => {

                _.each(operations, o => WarehouseItemOperation.eject(o));

                const ops = _.map(warehouseItems, item => {
                  _.assign(item, {
                    currentBoxId: warehouseBox.id,
                    processing: 'stock',
                  });
                  return item.DSCreate();
                });

                return $q.all(ops)
                  .then(() => warehouseBox);

              });
          });

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

      /*
      Sounds
       */

      replyNewBox() {
        SoundSynth.say('Новая коробка');
      },

      replyNotFound() {
        SoundSynth.say('Неизвестный штрих-код');
      },

      replyInvalidType() {
        SoundSynth.say('Неизвестный тип штрих-кода');
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
