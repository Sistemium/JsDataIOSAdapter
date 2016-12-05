'use strict';

(function () {

  function SalesmanAuth($rootScope, $state, Schema, localStorageService) {

    const LOGIN_EVENT = 'salesman-login';
    const LOGOUT_EVENT = 'salesman-logout';
    const LOCAL_STORAGE_KEY = 'currentSalesmanId';

    const {Salesman} = Schema.models();

    let currentSalesman;
    let redirectTo;
    let initPromise;
    let isAuthorized;

    let service = {

      init: init,
      logout: logout,
      login: login,

      bindAll,
      watchCurrent,
      makeFilter,

      getCurrentUser: () => currentSalesman,
      isLoggedIn: () => !!currentSalesman

    };

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

    }

    function init() {

      initPromise = Salesman.findAll()
        .then(data => {

          isAuthorized = !!data.length;

          let salesmanId = localStorageService.get(LOCAL_STORAGE_KEY);
          let res = salesmanId && _.find(data, {id: salesmanId});

          return login(res || _.get(data, 'length') === 1 && _.first(data));

        });

      $rootScope.$on('$destroy', $rootScope.$on('$stateChangeStart', function (event, next, nextParams) {

        let needRoles = _.get(next, 'data.auth');

        if (needRoles === 'SalesmanAuth') {

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

      $rootScope.$on('$destroy', $rootScope.$on('auth-logout', logout));

    }

    function watchCurrent(scope, callback) {
      callback(currentSalesman);
      scope.$on(LOGIN_EVENT, () => callback(currentSalesman));
      scope.$on(LOGOUT_EVENT, () => callback(null));
      return service;
    }

    function bindAll(scope, expr, callback) {
      Salesman.bindAll({}, scope, expr, callback);
      return service;
    }

    function makeFilter(filter) {
      let res = _.isObject(filter) ? filter : {};
      if (currentSalesman) {
        res.salesmanId = currentSalesman.id;
      }
      return res;
    }

    return service;

  }

  angular.module('Sales')
    .service('SalesmanAuth', SalesmanAuth);

})();
