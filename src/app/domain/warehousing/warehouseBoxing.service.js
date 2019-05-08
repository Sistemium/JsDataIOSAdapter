(function () {

  angular.module('Warehousing')
    .service('WarehouseBoxing', WarehouseBoxing);

  function WarehouseBoxing(Schema, $q, SoundSynth, Language) {

    const { WarehouseBox, WarehouseItem, Article } = Schema.models();
    const { PickingOrder } = Schema.models();

    const NOCACHE = {
      bypassCache: true,
      cacheResponse: false,
      socketSource: 1,
      limit: 500,
    };

    return {

      findBoxById(id) {
        return WarehouseBox.find(id, NOCACHE);
      },

      findBoxByBarcode(barcode) {
        return WarehouseBox.findAll({ barcode }, NOCACHE)
          .then(_.first);
      },

      findBoxItems(currentBoxId) {
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

    };

  }


})();
