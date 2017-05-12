'use strict';

(function() {

  angular.module('Models').run(Schema => {

    Schema.register({

      name: 'PickingSessionWeighing',

      relations: {
        hasOne: {
          PickingSession: {
            localField: 'pickingSession',
            localKey: 'pickingSessionId'
          }
        }
      }

    });

  });

})();
