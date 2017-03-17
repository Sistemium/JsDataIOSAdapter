'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'RestrictionArticle',

      relations: {
        hasOne: {
          // Restriction: {
          //   localField: 'restriction',
          //   localKey: 'restrictionId'
          // },
          // Article: {
          //   localField: 'article',
          //   localKey: 'articleId'
          // }
        }
      }

    });

  });

})();
