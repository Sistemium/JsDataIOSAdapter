'use strict';

(function () {

  function PickerAuth($window, $rootScope, $state) {

    var currentPicker;
    var redirectTo;

    function logout() {
      currentPicker = undefined;
      $rootScope.$broadcast('picker-logout');
      $window.localStorage.removeItem('currentPickerId');
    }

    function init() {

      $rootScope.$on('$destroy', $rootScope.$on('$stateChangeStart', function (event, next, nextParams) {

        var needRoles = next.data && next.data.auth;

        if (needRoles && !currentPicker) {
          event.preventDefault();
          redirectTo = {
            state: next,
            params: nextParams
          };
          $state.go('login');
        }

      }));

      $rootScope.$on('$destroy', $rootScope.$on('auth-logout', logout));

    }

    return {

      init: init,

      getCurrentUser: function () {
        return currentPicker;
      },

      isLoggedIn: function () {
        return !!currentPicker;
      },

      isAdmin: function () {
        return true;
      },

      logout: logout,

      login: function (user) {

        if (!user || !user.id) {
          $window.localStorage.removeItem('currentPickerId');
          return $state.go('login');
        }

        currentPicker = user;

        $window.localStorage.setItem('currentPickerId', user.id);
        $rootScope.$broadcast('picker-login', currentPicker);

        if (redirectTo) {
          $state.go(redirectTo.state, redirectTo.params);
          redirectTo = false;
        } else {
          $state.go('home');
        }

      }
    };

  }

  angular.module('core.services')
    .service('PickerAuth', PickerAuth);

})();
