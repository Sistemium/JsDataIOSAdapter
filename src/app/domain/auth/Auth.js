'use strict';

(function () {

  angular.module('webPage').service('Auth', function ($rootScope,$state, Sockets, localStorageService) {

    var currentUser;

    $rootScope.$on('$stateChangeStart', function (event, next) {

      var needRoles = next.data && next.data.auth;

      if (needRoles && !currentUser) {
        event.preventDefault();
        $state.go('login');
      }

    });

    var sockAuth = function () {
      Sockets.emit('authorization', {accessToken: localStorageService.get('authorization')}, function (ack) {

        if (ack.isAuthorized) {
          Sockets.emit('sockData:register', function (dack) {
            $rootScope.$broadcast('socket:authorized',dack);
          });
        }

      });
    };

    sockAuth();

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

    };

  });

})();
