'use strict';

(function () {

  angular.module('webPage').service('Menu', function (InitService, Auth) {

    const SALES_ROLES = ['salesman', 'supervisor'];
    const PICKING_ROLES = ['picker'];

    const items = [{
      title: 'Сборка',
      state: 'picking.orderList({state:"notdone"})',
      needRoles: PICKING_ROLES
    }, {
      title: 'Сборщик',
      state: 'picker',
      needRoles: PICKING_ROLES
    }, {
      title: 'Каталог',
      state: 'sales.catalogue',
      needRoles: SALES_ROLES
    }, {
      title: 'Заказы',
      state: 'sales.saleOrders',
      needRoles: SALES_ROLES
    }, {
      title: 'Отгрузки',
      state: 'sales.shipmentList',
      needRoles: SALES_ROLES
    }, {
      title: 'Долги',
      state: 'sales.debtByOutlet',
      needRoles: SALES_ROLES
    }, {
      title: 'Выручка',
      state: 'sales.cashing',
      needRoles: SALES_ROLES
    }, {
      title: 'Клиенты',
      state: 'sales.territory',
      needRoles: SALES_ROLES
    }, {
      title: 'Акции',
      state: 'sales.campaigns',
      needRoles: SALES_ROLES
    }, {
      title: 'Фотоотчёты',
      state: 'sales.photoReports',
      needRoles: ['admin', 'tester']
      // needRoles: SALES_ROLES
    }, {
      title: 'Визиты',
      state: 'sales.visits',
      needRoles: SALES_ROLES
    }, {
      title: 'Фотопоток',
      state: 'photos.stream',
      needRoles: SALES_ROLES
    }, {
      title: 'Предзаказы',
      state: 'sales.prePreOrders',
      needRoles: 'pre-ordering'
    }, {
      title: 'Тесты',
      state: 'playground',
      needRoles: ['admin', 'tester']
    }];


    function setItemData(state, data) {
      _.assign (_.find(items, {state}), data);
    }

    function root() {

      return {

        title: 'Начало',
        state: 'home',

        items: _.filter(items, function (option) {
          return Auth.isAuthorized(option.needRoles);
        })

      };

    }


    return {
      root,
      setItemData
    };

  });

})();
