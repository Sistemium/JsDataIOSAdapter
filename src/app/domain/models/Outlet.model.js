'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'Outlet',

      labels: {
        multiple: 'Клиенты',
        single: 'Клиент'
      },

      relations: {
        hasOne: {
          Partner: {
            localField: 'partner',
            localKey: 'partnerId'
          },
          Location: {
            localField: 'location',
            localKey: 'locationId'
          }

        },
        hasMany: {
          OutletPhoto: {
            localField: 'photos',
            foreignKey: 'outletId'
          },
          Visit: {
            localField: 'visits',
            foreignKey: 'outletId'
          }
          // PickingRequest: {
          //   localField: 'pickingOrders',
          //   foreignKey: 'outlet'
          // }
        }
      },

      meta: {
        salesmanFilter
      }

    });

    function salesmanFilter(filter) {
      let bySalesman = filter.salesmanId ? {
        'ANY outletSalesmanContracts': {
          'salesmanId': {
            '==': filter.salesmanId
          }
        }
      } : {};

      return _.assign({where: bySalesman}, filter);
    }

  });

})();
