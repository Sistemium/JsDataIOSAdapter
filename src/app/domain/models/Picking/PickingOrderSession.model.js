'use strict';

(function() {

  angular.module('Models').run(Schema => {

    Schema.register({

      name: 'PickingOrderSession',

      relations: {
        hasOne: {
          PickingOrder: {
            localField: 'pickingOrder',
            localKey: 'pickingOrderId'
          },
          PickingSession: {
            localField: 'pickingSession',
            localKey: 'pickingSessionId'
          }
        }
      }

    });

  });

})();

