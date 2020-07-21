'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'OutletArticle',

      relations: {
        hasOne: {
          // Outlet: {
          //   localField: 'outlet',
          //   localKey: 'outletId'
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
