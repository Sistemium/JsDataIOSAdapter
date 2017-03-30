'use strict';

(function () {

  angular.module('Models').run(Schema => {

    Schema.register({

      name: 'Shipment',

      relations: {
        hasOne: {
          Salesman: {
            localField: 'salesman',
            localKey: 'salesmanId'
          },
          Outlet: {
            localField: 'outlet',
            localKey: 'outletId'
          }
        },
        hasMany: {
          ShipmentPosition: {
            localField: 'positions',
            foreignKey: 'shipmentId'
          }
        }
      },

      defaultValues: {
      },

      watchChanges: false,

      meta: {
      },

      methods: {
        totalCost: function() {
          return Schema.aggregate('cost').sum(this.positions);
        }
      }

    });

  });

})();
