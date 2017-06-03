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
          Driver: {
            localField: 'driver',
            localKey: 'driverId'
          },
          Salesman: {
            localField: 'salesman',
            localKey: 'salesmanId'
          },
          Outlet: {
            localField: 'outlet',
            localKey: 'outletId'
          },
          SaleOrder: {
            localField: 'saleOrder',
            localKey: 'saleOrderId'
          },
          ShipmentEgais: {
            localField: 'egais',
            foreignKey: 'shipmentId'
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
        },

        totalCostDoc: function() {
          return _.sumBy(this.positions, pos => pos.volume * pos.priceDoc);
        }

      }

    });

    function positionsCountRu(count) {
      return wDict[Language.countableState(count || this.positions.length)];
    }

  });

})();
