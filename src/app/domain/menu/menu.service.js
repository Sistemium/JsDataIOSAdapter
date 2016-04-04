'use strict';

(function () {

    angular.module('webPage').service('Menu', function () {

      return {
        root: function () {
          return {

            title: 'Начало',
            state: 'home',

            items: [{
              title: 'Тестовый раздел',
              state: 'playground'
            },{
              title: 'Наборка',
              state: 'picking.orderList'
            }]

          };
        }
      }

    });

})();
