'use strict';

(function () {

  angular.module('Models').run(function (Schema, PhotoHelper) {

    let config = PhotoHelper.setupModel({

      name: 'VisitPhoto',

      relations: {
        hasOne: {
          Visit: {
            localField: 'visit',
            localKey: 'visitId'
          }
        }
      }

    });

    Schema.register(config);

  });

})();
