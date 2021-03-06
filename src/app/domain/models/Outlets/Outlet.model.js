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
          },
          Cashing: {
            localField: 'cashings',
            foreignKey: 'outletId'
          },
          Debt: {
            localField: 'debts',
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
        salesmanFilter,
        label: {
          accusative: 'точку'
        }
      }

    });

    function salesmanFilter(filter) {

      if (IOS.isIos() && filter.salesmanId) {

        let bySalesman = {
          'ANY outletSalesmanContracts': {
            'salesmanId': {'==': filter.salesmanId}
          }
        };

        _.each(_.omit(filter, 'salesmanId'), (val, key) => {
          bySalesman[key] = {'==': val};
        });

        filter = {where: bySalesman};

      }

      return filter;

    }

  });

})();
