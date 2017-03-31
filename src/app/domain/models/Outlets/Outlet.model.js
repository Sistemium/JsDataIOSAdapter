'use strict';

(function () {

  angular.module('Models').run(function (Schema, IOS) {

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
          // },
          // OutletRestriction: {
          //   localField: 'outletRestrictions',
          //   foreignKey: 'outletId'
          // },
          // SalesmanOutletRestriction: {
          //   localField: 'salesmanOutletRestrictions',
          //   foreignKey: 'outletId'
          // }
        }
      },

      meta: {
        salesmanFilter
      }

    });

    function salesmanFilter(filter) {

      if (IOS.isIos() && filter.salesmanId) {

        let bySalesman = {
          'ANY outletSalesmanContracts': {
            'salesmanId': {'==': filter.salesmanId}
          }
        };

        filter = _.assign({where: bySalesman}, _.omit(filter, 'salesmanId'));

      }

      return filter;

    }

  });

})();
