'use strict';

(function () {

  angular.module('webPage').service('Auth', function ($rootScope,$state) {

    var currentUser;

    $rootScope.$on('$stateChangeStart', function (event, next, nextParams) {

      var needRoles = next.data && next.data.auth;

      if (needRoles && !currentUser) {
        event.preventDefault();
        $state.go('login');
      }

    });

    return {

      getCurrentUser: function () {
        return currentUser;
      },

      isLoggedIn: function () {
        return !!currentUser;
      },

      isAdmin: function () {
        return true;
      },

      logout: function () {
        currentUser = undefined;
        $rootScope.$broadcast('auth-logout');
      },

      login: function (user) {
        currentUser = user;
        $rootScope.$broadcast('auth-login',currentUser);
      }

    }

  });

})();
