'use strict';

(function () {

  angular.module('jsd').run(['Schema', function (Schema) {

    Schema.register({

      name: 'VisitPicture',

      labels: {
        multiple: 'Фотографии визита',
        single: 'Фотография визита'
      },

      relations: {
        hasOne: {
          Visit: {
            localField: 'visit',
            localKey: 'visitId'
          }
        }
      },

      methods: {
      }

    });

  }]);

})();
