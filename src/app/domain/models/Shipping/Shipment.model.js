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

        egaisCached: cachedValue('egaisCached'),
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

      let cache = caches[shipment.id] = {
        egaisCached: shipment.egais || null
      };

      let shipmentId = shipment.id;

      const {ShipmentEgais, ShipmentPosition} = Schema.models();

      ShipmentPosition.findAll({shipmentId}, {cacheResponse: false})
        .then(positions => {
          _.assign(cache, {
            positions: positions.length || 0,
            totalCostDoc: _.sumBy(positions, pos => pos.volume * pos.priceDoc) || 0,
            totalCost: Schema.aggregate('cost').sum(positions) || 0
          })
        });

      ShipmentEgais.findAll({shipmentId}, {cacheResponse: false})
        .then(egais => {
          _.assign(cache, {
            egaisCached: _.first(egais) || null
          });
        });

    }

    function clearCaches() {
      caches = {};
    }

    function ifPositionsChanged() {
      return `${Schema.model('ShipmentPosition').lastModified()}|${Schema.model('ShipmentEgais').lastModified()}`;
    }

    function positionsCountRu(count) {
      return wDict[Language.countableState(count || this.positions.length)];
    }

  });

})();
