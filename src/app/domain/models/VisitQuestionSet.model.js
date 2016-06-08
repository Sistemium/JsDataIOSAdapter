'use strict';

(function () {

  angular.module('jsd').run(function (Schema) {

    Schema.register({

      name: 'VisitQuestionSet',

      labels: {
        multiple: 'Разделы опросников',
        single: 'Раздел опросников',
        of: 'раздела опросников'
      },

      relations: {
        hasMany: {
          VisitQuestionGroup: {
            localField: 'questionGroups',
            foreignKey: 'visitQuestionSetId'
          }
        }
      },

      computed: {
      }

    });

  });

})();
