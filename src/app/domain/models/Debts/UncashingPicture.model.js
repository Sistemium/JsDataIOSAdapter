'use strict';

(function () {

  angular.module('Models').run(function (Schema, PhotoHelper) {

    const config = PhotoHelper.setupModel({

      name: 'UncashingPicture',

      relations: {
        hasOne: {
          Uncashing: {
            localField: 'uncashing',
            localKey: 'uncashingId'
          }
        }
      }

    });

    Schema.register(config);

  });

})();
