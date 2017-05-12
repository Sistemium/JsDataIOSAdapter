'use strict';

(() => {

  angular.module('Models').run(Schema => {

    Schema.register({

      name: 'PickingSession',

      relations: {
        hasOne: {
          // Picker: {
          //   localField: 'picker',
          //   localKey: 'pickerId'
          // },
          // Site: {
          //   localField: 'site',
          //   localKey: 'siteId'
          // }
        }
      }

    });

  });

})();
