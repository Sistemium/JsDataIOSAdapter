'use strict';

(function () {

    angular.module('webPage').service('Menu', function (InitService) {

      return {
        root: function () {
          var menu = {

            title: 'Начало',
            state: 'home',

            items: [{
              title: 'Сборка',
              state: 'picking.orderList({state:"notdone"})'
            }]

          };

          if (InitService.localDevMode) {
            menu.items.push({
              title: 'Тесты',
              state: 'playground'
            });
          }

          return menu;
        }
      }

    });

})();
