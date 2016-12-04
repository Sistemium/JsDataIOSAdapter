'use strict';

(function () {

  function SalesmanAuth($window, $rootScope, $state, Schema) {

    const LOGIN_EVENT = 'salesman-login';
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
      $rootScope.$broadcast('salesman-logout');
      $window.localStorage.removeItem('currentSalesmanId');
    }

    function login(user) {

      loginPromise = false;

      if (!user || !user.id) {
        $window.localStorage.removeItem('currentSalesmanId');
        return $state.go('salesmanLogin');
      }

      currentSalesman = user;

      $window.localStorage.setItem('currentSalesmanId', user.id);
      $rootScope.$broadcast(LOGIN_EVENT, currentSalesman);

      if (redirectTo) {
        $state.go(redirectTo.state, redirectTo.params);
        redirectTo = false;
      }

    }

    function init() {

      loginPromise = Salesman.findAll()
        .then(res => {
          return login(_.first(res));
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
