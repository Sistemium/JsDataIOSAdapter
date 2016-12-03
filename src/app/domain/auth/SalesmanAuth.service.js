'use strict';

(function () {

  function SalesmanAuth($window, $rootScope, $state, Schema) {

    var currentSalesman;
    var redirectTo;
    var loginPromise;

    function logout() {
      currentSalesman = undefined;
      $rootScope.$broadcast('salesman-logout');
      $window.localStorage.removeItem('currentSalesmanId');
    }

    function login (user) {

      loginPromise = false;

      if (!user || !user.id) {
        $window.localStorage.removeItem('currentSalesmanId');
        return $state.go('salesmanLogin');
      }

      currentSalesman = user;

      $window.localStorage.setItem('currentSalesmanId', user.id);
      $rootScope.$broadcast('salesman-login', currentSalesman);

      if (redirectTo) {
        $state.go(redirectTo.state, redirectTo.params);
        redirectTo = false;
      } else {
        $state.go('home');
      }

    }

    function init() {

      var SM = Schema.model('Salesman');

      loginPromise = SM.findAll()
        .then(function(res){
          if (res.length) {
            login (res[0]);
          }
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

    return {

      init: init,
      logout: logout,
      login: login,

      getCurrentUser: () => currentSalesman,
      isLoggedIn: () => !!currentSalesman

    };

  }

  angular.module('Sales')
    .service('SalesmanAuth', SalesmanAuth);

})();
