'use strict';

(function () {

    angular.module('webPage').service('Menu', function (InitService,Auth) {

      return {
        root: function () {
          var menu = {

            title: 'Начало',
            state: 'home',

            items: [{
              title: 'Сборка',
              state: 'picking.orderList({state:"notdone"})',
              needRoles: 'picker'
            },{
              title: 'Визиты',
              state: 'sales.territory',
              needRoles: 'salesman'
            },{
              title: 'Предзаказы',
              state: 'sales.prePreOrders',
              needRoles: 'pre-ordering'
            },{
              title: 'Тесты',
              state: 'playground',
              needRoles: ['admin','tester']
            }]

          };

          _.remove(menu.items,function(option){
            return !Auth.isAuthorized(option.needRoles);
          });

          return menu;
        }
      }

    });

})();
