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

      fieldTypes: {
        volume: 'int'
      }

    });

  });

})();
