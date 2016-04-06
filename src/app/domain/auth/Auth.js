'use strict';

(function () {

  angular.module('webPage').service('Auth', function ($rootScope,$state, Sockets) {

    var currentUser;

    var needAuth = $rootScope.$on('$stateChangeStart', function (event, next) {

      var needRoles = next.data && next.data.auth;

      if (needRoles && !currentUser) {
        event.preventDefault();
        $state.go('login');
      }

    });

    $rootScope.$on('$destroy', needAuth);

    var sockAuth = function () {
      var accessToken = window.localStorage.getItem('authorization');
      Sockets.emit('authorization', {accessToken: accessToken}, function (ack) {

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
