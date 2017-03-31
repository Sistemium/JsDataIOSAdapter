'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'PartnerArticle',

      relations: {
        hasOne: {
          // Partner: {
          //   localField: 'partner',
          //   localKey: 'partnerId'
          // },
          // Article: {
          //   localField: 'article',
          //   localKey: 'articleId'
          // }
        }
      },

      watchChanges: false

    });

  });

})();
