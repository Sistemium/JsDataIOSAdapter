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

        var needRoles = _.get(next, 'data.auth');

        if (needRoles === 'pickerAuth') {

          let isAuthorized = !!currentPicker;

          if (!isAuthorized) {
            event.preventDefault();
            redirectTo = {
              state: next,
              params: nextParams
            };
            return $state.go('login');
          } else if (event.defaultPrevented) {
            event.defaultPrevented = false;
          }

          event[needRoles] = true;

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

      login: function (user,to) {

        var redirect = to || redirectTo;

        if (!user || !user.id) {
          $window.localStorage.removeItem('currentPickerId');
          return $state.go('login');
        }

        currentPicker = user;

        $window.localStorage.setItem('currentPickerId', user.id);
        $rootScope.$broadcast('picker-login', currentPicker);

        if (redirect) {
          $state.go(redirect.state || redirect.name, redirect.params);
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
