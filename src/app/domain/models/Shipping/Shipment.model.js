'use strict';

(function () {

  angular.module('Models').run((Schema, Language) => {

    const wDict = {
      w1: 'позиция',
      w24: 'позиции',
      w50: 'позиций'
    };

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

        positionsCountRu,

        totalCost: function() {
          return Schema.aggregate('cost').sum(this.positions);
        }
      }

    });

    function positionsCountRu(count) {
      return wDict[Language.countableState(count || this.positions.length)];
    }

  });

})();
