'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'LegalForm',

      relations: {
        hasMany: {
          Partner: {
            localField: 'partners',
            foreignKey: 'legalFormId'
          }
        }
      }

    });

  });

})();
