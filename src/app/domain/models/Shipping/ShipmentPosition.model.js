'use strict';

(function () {

  angular.module('Models').run(Schema => {

    Schema.register({

      name: 'ShipmentPosition',

      relations: {
        hasOne: {
          Shipment: {
            localField: 'shipment',
            localKey: 'shipmentId'
          },
          Article: {
            localField: 'article',
            localKey: 'articleId'
          }
        }
      },

      computed: {
        cost: ['volume', 'price', function (volume, price) {
          return _.round(volume * price, 2);
        }]
      },

      defaultValues: {},

      watchChanges: false,

      meta: {},

      methods: {}

    });

  });

})();
