'use strict';

(function () {

  function SalesmanAuth($rootScope, $state, Schema, localStorageService, InitService, Sockets, IOS, DEBUG, Menu) {

    const LOGIN_EVENT = 'salesman-login';
    const LOGOUT_EVENT = 'salesman-logout';
    const LOCAL_STORAGE_KEY = 'currentSalesmanId';

    const {Salesman} = Schema.models();

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

      getCurrentUser: () => currentSalesman,
      isLoggedIn: () => !!currentSalesman

    };

    salesModuleRun();

    $rootScope.$on('$destroy', $rootScope.$on('$stateChangeStart', function (event, next, nextParams) {

      let needRoles = _.get(next, 'data.auth');

      if (needRoles === 'SalesmanAuth') {

        event[needRoles] = true;

        if (!isAuthorized) {
          event.preventDefault();
        }

        if (initPromise) {
          redirectTo = {
            state: next,
            params: nextParams
          };
        } else {
          // TODO: maybe add toast with error message
        }

      }

    }));


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

      $rootScope.$on('$destroy', $rootScope.$on('auth-logout', logout));

      return initPromise;

    }

    function watchCurrent(scope, callback) {
      let un1 = scope.$on(LOGIN_EVENT, () => callback(currentSalesman));
      let un2 = scope.$on(LOGOUT_EVENT, () => callback(null));
      callback(currentSalesman);
      scope.$on('$destroy', ()=>{
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

      let SUBSCRIPTIONS = ['Stock', 'SaleOrder', 'SaleOrderPosition'];

      InitService.then(service.init)
        .then(salesmanAuth => {

          if (IOS.isIos()) {
            SUBSCRIPTIONS.push('RecordStatus');
            Sockets.onJsData('jsData:update', onRecordStatus);
          }

          if (salesmanAuth.getCurrentUser() || salesmanAuth.hasOptions) {
            DEBUG('Sales module will jsDataSubscribe:', SUBSCRIPTIONS);
            Sockets.jsDataSubscribe(SUBSCRIPTIONS);
          }

          const {Workflow, SaleOrder} = Schema.models();

          Workflow.findAll({code: 'SaleOrder.v2'})
            .then(workflow => {
              Schema.workflowSaleOrder = _.get(_.first(workflow), 'workflow');
            })
            .catch(e => console.error('Workflow find error:', e));

          function setBadges() {
            let filter = salesmanAuth.makeFilter({processing: 'draft'});
            SaleOrder.groupBy(filter)
              .then(data => {
                Menu.setItemData('sales.saleOrders', {badge: data.length});
              });
          }

          $rootScope.$on('menu-show', setBadges);

          setBadges();

        });

      function onRecordStatus(event) {

        if (event.resource !== 'RecordStatus') return;

        try {
          Schema
            .model(event.data.name)
            .eject(event.data.objectXid);
        } catch (e) {
          console.warn('onRecordStatus error:', e);
        }

      }

    }

    return service;

  }

  angular.module('core.services')
    .service('SalesmanAuth', SalesmanAuth);

})();
