'use strict';

(function () {

    angular.module('webPage').service('Menu', function () {

      return {
        root: function () {
          return {

            title: 'Начало',
            state: 'home',

            items: [{
              title: 'Тесты',
              state: 'playground'
            },{
              title: 'Сборка',
              state: 'picking.orderList'
            }]

          };
        }
      }

    });

})();
