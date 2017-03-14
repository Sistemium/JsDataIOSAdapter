'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'Outlet',

      labels: {
        multiple: 'Клиенты',
        single: 'Клиент'
      },

      // TODO check if it's not breaking editing
      watchChanges: false,

      relations: {
        hasOne: {
          Partner: {
            localField: 'partner',
            localKey: 'partnerId'
          },
          Location: {
            localField: 'location',
            localKey: 'locationId'
          },
          OutletPhoto: {
            localField: 'avatar',
            localKey: 'avatarPictureId'
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
          },
          SaleOrder: {
            localField: 'saleOrders',
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
