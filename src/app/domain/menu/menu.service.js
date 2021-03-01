'use strict';

(function () {

  angular.module('webPage').service('Menu', function (InitService, Auth, DomainOption) {

    const SALES_ROLES = ['salesman', 'supervisor'];
    const MARKETING_ROLES = _.union(['sales', 'coordinator', 'newsMaker', 'actions', 'stg'], SALES_ROLES);
    const PICKING_ROLES = ['picker'];
    const STOCK_TAKING_ROLES = ['stockTaking'];
    const ADMIN_ROLES = ['admin', 'tester'];
    const OUTLET_ROLES = _.union(['outlet'], SALES_ROLES);
    const CATALOGUE_ROLES = _.union(MARKETING_ROLES, SALES_ROLES, OUTLET_ROLES);

    const items = [{
      title: 'Сборка',
      state: 'picking.orderList({state:"notdone"})',
      needRoles: PICKING_ROLES
    }, {
      title: 'Сборщик',
      state: 'picker',
      needRoles: PICKING_ROLES
    }, {
      title: 'Коробки',
      state: 'wh.warehouseBoxing',
      needRoles: PICKING_ROLES
    }, {
      title: 'Номенклатура',
      state: 'wh.articling',
      needRoles: PICKING_ROLES
    }, {
      title: 'Склады',
      state: 'wh.warehouses',
      needRoles: STOCK_TAKING_ROLES
    }, {
      title: 'Инвентаризация',
      state: 'wh.stockTaking',
      needRoles: STOCK_TAKING_ROLES
    }, {
      title: 'Каталог',
      state: 'sales.catalogue',
      needRoles: CATALOGUE_ROLES
    }, {
      title: 'Заказы',
      state: 'sales.saleOrders',
      needRoles: SALES_ROLES,
      disabled: DomainOption.saleOrdersDisabled
    }, {
      title: 'Отгрузки',
      state: 'sales.shipmentList',
      needRoles: OUTLET_ROLES
    }, {
      title: 'Лента новостей',
      state: 'newsFeed',
      needRoles: MARKETING_ROLES
    }, {
      title: 'Долги',
      state: 'sales.debtByOutlet',
      needRoles: OUTLET_ROLES
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
      needRoles: _.union(['outlet'], MARKETING_ROLES)
    }, {
      title: 'Фото-отчёты',
      state: 'sales.photoReports',
      needRoles: SALES_ROLES
    }, {
      title: 'Визиты',
      state: 'sales.visits',
      needRoles: SALES_ROLES,
      disabled: DomainOption.visitsDisabled
    },{
      title: 'Проверка Точек',
      state: 'sales.outletTasks',
      needRoles: SALES_ROLES,
      disabled: DomainOption.outletTasksDisabled
    // }, {
      // title: 'Фотопоток',
      // state: 'photos.stream',
      // needRoles: SALES_ROLES
      // needRoles: ['admin', 'tester']
    }, {
      title: 'Тесты',
      state: 'playground',
      needRoles: ADMIN_ROLES
    }, {
      title: 'Цели по SKU',
      state: 'sales.targets',
      needRoles: SALES_ROLES,
      disabled: () => !DomainOption.salesTargets(),
    }];


    function setItemData(state, data) {
      _.assign(_.find(items, {state}), data);
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
