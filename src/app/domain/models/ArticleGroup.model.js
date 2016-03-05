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
          }
        }

      });

    });

})();
