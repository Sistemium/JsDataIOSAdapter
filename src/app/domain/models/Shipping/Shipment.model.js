'use strict';

(function () {

  angular.module('Models').run((Schema, Language, DS, $rootScope) => {

    const wDict = {
      w1: 'позиция',
      w24: 'позиции',
      w50: 'позиций'
    };

    let caches = {};

    let omit = ['egaisCached'];

    omit.push(...DS.defaults.omit);

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

      defaultValues: {},

      watchChanges: false,

      meta: {},

      omit,

      methods: {

        positionsCountRu,

        egaisCached: function () {

          if (!this.cachedEgais) {
            this.cachedEgais = this.egais || null;
          }

          return this.cachedEgais;

        },

        totalCost: cachedValue('totalCost'),
        totalCostDoc: cachedValue('totalCostDoc'),
        totalPositions: cachedValue('positions')

      }

    });

    // TODO: move to separate ModelCaching service

    $rootScope.$watch(ifPositionsChanged, clearCaches);

    function cachedValue(name) {
      return function () {
        if (!caches[this.id]) {
          setCaches(this);
        }
        return caches[this.id][name];
      }
    }

    function setCaches(shipment) {
      caches[shipment.id] = {
        totalCostDoc: _.sumBy(shipment.positions, pos => pos.volume * pos.priceDoc) || null,
        totalCost: Schema.aggregate('cost').sum(shipment.positions) || null,
        positions: shipment.positions.length || null
      };
    }

    function clearCaches() {
      caches = {};
    }

    function ifPositionsChanged() {
      return Schema.model('ShipmentPosition').lastModified();
    }

    function positionsCountRu(count) {
      return wDict[Language.countableState(count || this.positions.length)];
    }

  });

})();
