'use strict';

(function () {

  angular.module('jsd').run(function (Schema) {

    Schema.register({

      name: 'VisitQuestionDataType',

      labels: {
        multiple: 'Типы данных опросников',
        single: 'Тип данных опросников',
        of: 'типа данных опросников'
      },

      relations: {
        hasMany: {
          VisitQuestion: {
            localField: 'questions',
            foreignKey: 'visitQuestionDataTypeId'
          }
        }
      },

      computed: {
      }

    });

  });

})();
