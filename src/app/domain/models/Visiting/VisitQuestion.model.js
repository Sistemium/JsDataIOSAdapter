'use strict';

(function () {

  angular.module('jsd').run(function (Schema) {

    Schema.register({

      name: 'VisitQuestion',

      labels: {
        multiple: 'Вопросы визитов',
        single: 'Вопрос визитов',
        of: 'вопроса визитов'
      },

      relations: {
        hasOne: {
          VisitQuestionGroup: {
            localField: 'group',
            localKey: 'visitQuestionGroupId'
          },
          VisitQuestionDataType: {
            localField: 'dataType',
            localKey: 'visitQuestionDataTypeId'
          }
        },
        hasMany: {
          VisitAnswer: {
            localField: 'answers',
            foreignKey: 'questionId'
          }
        }
      },

      computed: {
      }

    });

  });

})();
