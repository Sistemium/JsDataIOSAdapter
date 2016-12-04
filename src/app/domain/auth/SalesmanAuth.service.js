'use strict';

(function () {

  function SalesmanAuth($rootScope, $state, Schema, localStorageService) {

    const LOGIN_EVENT = 'salesman-login';
    const LOGOUT_EVENT = 'salesman-logout';
    const LOCAL_STORAGE_KEY = 'currentSalesmanId';

    const {Salesman} = Schema.models();

    let currentSalesman;
    let redirectTo;
    let loginPromise;

    let service = {

      init: init,
      logout: logout,
      login: login,
      bindAll,

      watchCurrent,

      getCurrentUser: () => currentSalesman,
      isLoggedIn: () => !!currentSalesman

    };

    function logout() {
      currentSalesman = undefined;
      $rootScope.$broadcast(LOGOUT_EVENT);
      localStorageService.remove(LOCAL_STORAGE_KEY);
    }

    function login(user) {

      loginPromise = false;

      if (!user || !user.id) {
        localStorageService.remove(LOCAL_STORAGE_KEY);
        return $state.go('salesmanLogin');
      }

      currentSalesman = user;

      localStorageService.set(LOCAL_STORAGE_KEY, user.id);
      $rootScope.$broadcast(LOGIN_EVENT, currentSalesman);

      if (redirectTo) {
        $state.go(redirectTo.state, redirectTo.params);
        redirectTo = false;
      }

    }

    function init() {

      loginPromise = Salesman.findAll()
        .then(data => {
          let salesmanId = localStorageService.get(LOCAL_STORAGE_KEY);
          let res = salesmanId && _.find(data, {id: salesmanId});
          return login(res || _.first(data));
        });

      $rootScope.$on('$destroy', $rootScope.$on('$stateChangeStart', function (event, next, nextParams) {

        var needRoles = _.get(next, 'data.auth');

        if (needRoles === 'SalesmanAuth' && !currentSalesman) {
          event.preventDefault();
          redirectTo = {
            state: next,
            params: nextParams
          };
          if (!loginPromise) {
            $state.go('salesmanLogin');
          }
        }

      }));

      $rootScope.$on('$destroy', $rootScope.$on('auth-logout', logout));

    }

    function watchCurrent(scope, callback) {
      if (currentSalesman) callback(currentSalesman);
      scope.$on(LOGIN_EVENT, () => callback(currentSalesman));
      return service;
    }

    function bindAll(scope, expr) {
      Salesman.bindAll({}, scope, expr);
      return service;
    }

    return service;

  }

  angular.module('Sales')
    .service('SalesmanAuth', SalesmanAuth);

})();
