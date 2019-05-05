(function () {

  angular.module('Warehousing')
    .service('WarehouseBoxing', WarehouseBoxing);

  function WarehouseBoxing(Schema) {

    const { WarehouseBox, WarehouseItem, Article } = Schema.models();
    const { PickingOrder } = Schema.models();

    const NOCACHE = { bypassCache: true, cacheResponse: false };

    return {

      findBoxById(id) {
        return WarehouseBox.find(id, NOCACHE);
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
          return;
        }
        return PickingOrder.find(id, NOCACHE);
      }

    };

  }


})();
