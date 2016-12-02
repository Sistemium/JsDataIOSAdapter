'use strict';

(function () {

  angular.module('Models').run(function (Schema, localStorageService) {

    let model = Schema.register({

      name: 'PriceType',

      relations: {
        hasMany: {
          Price: {
            localField: 'prices',
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

      meta: {

        getDefault: function () {
          let id = localStorageService.get('PriceType.default');
          let res = id && model.get(id);
          if (!res) {
            res = _.first(model.filter({limit: 1}))
          }
          return res;
        },

        setDefault: function (idOrModel) {
          localStorageService.set('PriceType.default', _.get(idOrModel, 'id') || idOrModel);
        }


      },

      methods: {}

    });

  });

})();
