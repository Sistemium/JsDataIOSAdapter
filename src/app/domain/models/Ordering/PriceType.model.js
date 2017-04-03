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

      omit: ['isVisible'],

      meta: {

        getDefault: function () {
          let id = localStorageService.get('PriceType.default');
          let res = id && model.get(id);
          if (!_.get(res, 'isVisible')) {
            res = _.first(model.filter({limit: 1, isVisible: true}));
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
          let data = Schema.model('Price').meta.data;
          return data && data[this.id];
        }
      }

    });

  });

})();
