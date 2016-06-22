'use strict';

(function () {

  angular.module('jsd').run(['Schema', function (Schema) {

    Schema.register({

      name: 'VisitAnswer',

      labels: {
        multiple: 'Ответы визита',
        single: 'Ответ визита'
      },

      relations: {
        hasOne: {
          Visit: {
            localField: 'visit',
            localKey: 'visitId'
          },
          VisitQuestion: {
            localField: 'question',
            localKey: 'questionId'
          }
        }
      },

      methods: {
      }

    });

  }]);

})();
