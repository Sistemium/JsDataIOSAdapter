'use strict';

(function () {

  angular.module('jsd').run(['Schema', function (Schema) {

    Schema.register({

      name: 'Account',

      labels: {
        multiple: 'Пользователи',
        single: 'Пользователь'
      },

      relations: {
        hasMany: {
        }
      }

    });

  }]);

})();
