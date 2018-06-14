'use strict';

(function () {

  angular.module('Models').run(Schema => {

    Schema.register({

      name: 'ArticleBarCode',

      relations: {

        hasOne: {
          Article: {
            localField: 'article',
            localKey: 'articleId'
          }
        }

      },

      meta: {

      },

    });

  });

})();
