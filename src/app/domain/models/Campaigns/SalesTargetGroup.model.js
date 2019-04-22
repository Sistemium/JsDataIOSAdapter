'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'SalesTargetGroup',

      relations: {

        belongsTo: {
          ArticleGroup: {
            localField: 'articleGroup',
            localKey: 'articleGroupId'
          }
        },

        hasMany: {
          SalesTarget: {
            localField: 'targets',
            foreignKey: 'targetGroupId',
          },
        },

      },

      meta: {}

    });

  });

})();
