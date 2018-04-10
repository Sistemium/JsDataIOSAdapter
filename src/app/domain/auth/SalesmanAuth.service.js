'use strict';

(function () {

  function SalesmanAuth($rootScope, $state, Schema, localStorageService, InitService, Sockets, IOS, DEBUG, Menu, Auth, DomainOption) {

    const LOGIN_EVENT = 'salesman-login';
    const LOGOUT_EVENT = 'salesman-logout';
    const LOCAL_STORAGE_KEY = 'currentSalesmanId';

    const {Salesman, Responsibility} = Schema.models();

    let currentSalesman;
    let redirectTo;
    let initPromise = true;
    let isAuthorized;

    let service = {

      hasOptions: false,

      init: init,
      logout: logout,
      login: login,

      bindAll,
      watchCurrent,
      makeFilter,

      responsibility,

      getCurrentUser: () => currentSalesman,
      isLoggedIn: () => !!currentSalesman

    };

    const SalesmanAuth = service;

    $rootScope.$on('$destroy', $rootScope.$on('$stateChangeStart', function (event, next, nextParams) {

      let needRoles = _.get(next, 'data.auth');

      if (needRoles === 'SalesmanAuth') {

        event[needRoles] = true;

        if (!isAuthorized) {
          event.preventDefault();
          redirectTo = {
            state: next,
            params: nextParams
          };
        } else if (event.defaultPrevented) {
          event.defaultPrevented = false;
        }

      }

    }));

    salesModuleRun();


    function responsibility() {
      return _.get(currentSalesman, 'responsibility') || Auth.role('saleType');
    }

    function logout() {
      currentSalesman = undefined;
      $rootScope.$broadcast(LOGOUT_EVENT);
      localStorageService.remove(LOCAL_STORAGE_KEY);
    }

    function login(user) {

      initPromise = false;

      if (!user || !user.id) {
        user = null;
        localStorageService.remove(LOCAL_STORAGE_KEY);
        $rootScope.$broadcast(LOGOUT_EVENT);
      } else {
        localStorageService.set(LOCAL_STORAGE_KEY, user.id);
        $rootScope.$broadcast(LOGIN_EVENT, currentSalesman = user);
      }

      if (redirectTo) {
        // console.info('SalesmanAuth redirect to:', redirectTo.state, redirectTo.params);
        $state.go(redirectTo.state, redirectTo.params);
        redirectTo = false;
      }

      return user;

    }

    function init() {

      // console.info('SalesmanAuth init');

      initPromise = Salesman.findAll()
        .then(data => {

          isAuthorized = !!data.length;
          service.hasOptions = data.length > 1;

          let salesmanId = localStorageService.get(LOCAL_STORAGE_KEY);
          let res = salesmanId && _.find(data, {id: salesmanId});

          login(res || data.length === 1 && _.first(data));

          return service;

        });

      $rootScope.$on('auth-logout', logout);

      return initPromise;

    }

    function watchCurrent(scope, callback) {
      let un1 = scope.$on(LOGIN_EVENT, () => callback(currentSalesman));
      let un2 = scope.$on(LOGOUT_EVENT, () => callback(null));
      if (isAuthorized) {
        callback(currentSalesman);
      }
      scope.$on('$destroy', () => {
        un1();
        un2();
      });
      return service;
    }

    function bindAll(scope, expr, callback) {
      Salesman.bindAll({
        orderBy: 'name'
      }, scope, expr, callback);
      return service;
    }

    function makeFilter(filter) {
      let res = _.isObject(filter) ? filter : {};
      if (currentSalesman) {
        res.salesmanId = currentSalesman.id;
      }
      return res;
    }

    function salesModuleRun() {

      let SUBSCRIPTIONS = [
        'Stock', 'SaleOrder', 'SaleOrderPosition', 'Outlet', 'Visit', 'Partner', 'Contract'
      ];

      const {Workflow, SaleOrder, NewsMessage, ArticleGroup} = Schema.models();

      $rootScope.$on('menu-show', setBadges);

      InitService.then(SalesmanAuth.init)
        .then(salesmanAuth => {

          if (IOS.isIos()) {
            SUBSCRIPTIONS.push('RecordStatus');
          }

          Sockets.onJsData('jsData:update', onJSData);
          Sockets.onJsData('jsData:destroy', onJSDataDestroy);

          if (salesmanAuth.getCurrentUser() || salesmanAuth.hasOptions) {
            DEBUG('Sales module will jsDataSubscribe:', SUBSCRIPTIONS);
            Sockets.jsDataSubscribe(SUBSCRIPTIONS);
          }

          // setBadges();

          Responsibility.meta.initData(DomainOption);

          return getWorkflow('SaleOrder.v2', 'workflowSaleOrder')
            .then(() => {

              if (Auth.isAuthorized('supervisor')) {
                return getWorkflow('SaleOrder.v2.sv', 'workflowSaleOrderSupervisor');
              } else {
                return getWorkflow('SaleOrder.v2', 'workflowSaleOrderSupervisor');
              }

            })
            .then(() => {
                ArticleGroup.cachedFindAll();
              _.each(SaleOrder.getAll(), saleOrder => SaleOrder.compute(saleOrder));
            });


        });

      function getWorkflow(code, codeAs) {

        return Workflow.findAll({code})
          .then(workflow => {
            SaleOrder.meta[codeAs] = _.get(_.first(workflow), 'workflow');
          })
          .catch(e => console.error('Workflow find error:', e));

      }

      function onJSData(event) {

        if (event.resource.match(/Partner|Outlet|Contract/)) {

          let model = Schema.model(event.resource);

          if (event.data.name) {
            model.inject(event.data);
          } else {
            model.find(event.data.id, {bypassCache: true});
          }

        }

        if (event.resource !== 'RecordStatus') return;

        try {
          let {name, objectXid} = event.data;
          Schema.model(name)
            .eject(objectXid);
        } catch (e) {
          console.warn('onJSData error:', e);
        }

      }

      function onJSDataDestroy(event) {

        DEBUG('onJSDataDestroy', event);

        let id = _.get(event, 'data.id');

        if (!id) return;

        let model = Schema.model(event.resource);

        if (!model) return;

        model.eject(id);

      }

      function setBadges() {

        let filter = SalesmanAuth.makeFilter({processing: 'draft'});

        if (!DomainOption.visitsDisabled()) {
          Schema.model('Visit')
            .findAll(_.assign({date: moment().format(), finished: false}, filter), {bypassCache: true});
        }

        SaleOrder.groupBy(filter)
          .then(data => {
            Menu.setItemData('sales.saleOrders', {badge: data.length});
          });

        let actualFilter = NewsMessage.meta.filterActual();

        NewsMessage.findAllWithRelations(actualFilter, {bypassCache: true})('UserNewsMessage')
          .then(actual => {
            let unRated = _.filter(actual, message => message.isUnrated());
            Menu.setItemData('newsFeed', {badge: unRated.length});
          });
      }

    }

    return service;

  }

  angular.module('core.services')
    .service('SalesmanAuth', SalesmanAuth);

})();
