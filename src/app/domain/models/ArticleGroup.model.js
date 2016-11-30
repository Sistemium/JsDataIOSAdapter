'use strict';

(function () {

    angular.module('Models').run(function (Schema) {

      Schema.register({

        name: 'ArticleGroup',

        relations: {
          hasMany: {
            Article: {
              localField: 'Articles',
              foreignKey: 'articleGroup'
            }
          },
          hasOne: {
            ArticleGroup: {
              localField: 'articleGroup',
              localKey: 'articleGroupId'
            }
          }
        }

      });

    });

})();
