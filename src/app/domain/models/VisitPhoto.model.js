'use strict';

(function () {

    angular.module('Models').run(function (Schema, PhotoHelper) {

      Schema.register ({

        name: 'VisitPhoto',

        relations: {
          hasOne: {
            Visit: {
              localField: 'visit',
              localKey: 'visitId'
            }
          }
        },

        methods: {
          getImageSrc: function (size) {
            return PhotoHelper.getImageSrc(this, size);
          }
        }

      });

    });

})();
