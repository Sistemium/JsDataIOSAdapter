'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register ({

      name: 'Stock',

      relations: {
        hasOne: {
          Article: {
            localField: 'article',
            localKey: 'articleId'
          }
        }
      },

      watchChanges: false,
      useClass: false,
      instanceEvents: false,
      notify: false,

      meta: {
      },

      fieldTypes: {
        volume: 'int'
      }

    });

  });

})();
