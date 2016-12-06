'use strict';

(function () {

  angular.module('webPage').service('Menu', function (InitService, Auth) {

    return {
      root: function () {
        var menu = {

          title: 'Начало',
          state: 'home',

          items: [{
            title: 'Сборка',
            state: 'picking.orderList({state:"notdone"})',
            needRoles: 'picker'
          }, {
            title: 'Сборщик',
            state: 'picker',
            needRoles: 'picker'
          }, {
            title: 'Клиенты',
            state: 'sales.territory',
            needRoles: 'salesman'
          }, {
            title: 'Визиты',
            state: 'sales.visits',
            needRoles: 'salesman'
          }, {
            title: 'Заказы',
            state: 'sales.saleOrders',
            needRoles: 'salesman' // TODO roles via state.data
          }, {
            title: 'Каталог',
            state: 'sales.catalogue',
            needRoles: 'salesman'
          }, {
            title: 'Фотопоток',
            state: 'photos.stream',
            needRoles: 'salesman'
          }, {
            title: 'Предзаказы',
            state: 'sales.prePreOrders',
            needRoles: 'pre-ordering'
          }, {
            title: 'Шедулы',
            state: 'sales.schedule',
            needRoles: 'salesman'
          }, {
            title: 'Тесты',
            state: 'playground',
            needRoles: ['admin', 'tester']
          }]

        };

        _.remove(menu.items, function (option) {
          return !Auth.isAuthorized(option.needRoles);
        });

        return menu;
      }
    }

  });

})();
