'use strict';

(function () {

  angular.module('webPage').service('Auth', function () {

    var user;

    return {

      getCurrentUser: function () {
        return user;
      },

      isLoggedIn: function () {
        return !!user;
      },

      isAdmin: function () {
        return true;
      },

      logout: function () {
        user = undefined;
      }

    }

  });

})();
