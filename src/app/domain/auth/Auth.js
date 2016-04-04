'use strict';

(function () {

  angular.module('webPage').service('Auth', function ($rootScope) {

    var currentUser;

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
