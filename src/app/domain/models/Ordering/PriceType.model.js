'use strict';

(function () {

  angular.module('Models').run(function (Schema, localStorageService) {

    let model = Schema.register({

      name: 'PriceType',

      relations: {
        hasMany: {
          // Price: {
          //   localField: 'prices',
          //   foreignKey: 'priceTypeId'
          // }
          SaleOrder: {
            localField: 'saleOrders',
            foreignKey: 'priceTypeId'
          }
        },
        hasOne: {
          PriceType: {
            localField: 'parent',
            localKey: 'parentId'
          }
        }
      },

      watchChanges: false,

      meta: {

        getDefault: function () {
          let id = localStorageService.get('PriceType.default');
          let res = id && model.get(id);
          if (!res) {
            res = _.first(model.filter({limit: 1}));
            if (res) {
              model.meta.setDefault(res);
            }
          }
          return res;
        },

        setDefault: function (idOrModel) {
          localStorageService.set('PriceType.default', _.get(idOrModel, 'id') || idOrModel);
        }


      },

      methods: {
        prices: function () {
          return Schema.model('Price').meta.data[this.id];
        }
      }

    });

  });

})();
