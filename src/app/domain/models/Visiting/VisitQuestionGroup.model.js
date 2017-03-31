'use strict';

(function () {

  angular.module('jsd').run(function (Schema) {

    Schema.register({

      name: 'VisitQuestionGroup',

      // TODO we need a labeling service

      labels: {
        multiple: 'Группы вопросов визитов',
        single: 'Группа вопросов визитов',
        of: 'группы визитов',
        the: 'группу визитов',
        whereTo: 'в группу визитов',
        whereAt: 'в группе визитов'
      },

      relations: {
        hasOne: {
          VisitQuestionSet: {
            localField: 'questionSet',
            localKey: 'visitQuestionSetId'
          }
        },
        hasMany: {
          VisitQuestion: {
            localField: 'questions',
            foreignKey: 'visitQuestionGroupId'
          }
        }
      },

      computed: {
      }

    });

  });

})();
