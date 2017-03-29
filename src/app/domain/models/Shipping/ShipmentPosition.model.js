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

      defaultValues: {
      },

      watchChanges: false,

      meta: {
      },

      methods: {
      }

    });

  });

})();
