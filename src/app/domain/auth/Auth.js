'use strict';

(function () {

  angular.module('webPage').service('Auth', function ($rootScope, $state, Sockets, InitService) {

    var me = this;
    var currentUser;
    var DEBUG = debug ('stg:Auth');

    function getAccessToken() {
      return window.localStorage.getItem('authorization');
    }

    function init() {

    }

    var needAuth = $rootScope.$on('$stateChangeStart', function (event, next, nextParams) {

      if (!getAccessToken() && next.name !== 'auth') {
        event.preventDefault();
        return $state.go('auth');
      }

      var needRoles = next.data && next.data.auth;

      if (needRoles && !currentUser) {
        event.preventDefault();
        me.redirectTo = {
          state: next,
          params: nextParams
        };
        $state.go('login');
      }

    });

    var onAuthenticated = $rootScope.$on('authenticated', function (event, res) {
      window.localStorage.setItem('authorization', res.accessToken);
      sockAuth();
    });

    $rootScope.$on('$destroy', function () {
      needAuth();
      onAuthenticated();
    });

    var sockAuth = function () {
      var accessToken = getAccessToken();
      if (!accessToken) {
        return;
      }
      Sockets.emit('authorization', {accessToken: accessToken}, function (ack) {
        DEBUG('Socket authorization:', ack);
        // TODO: entity subscription should do a controller, but we need to repeat it after reconect/auth
        Sockets.emitQ('jsData:subscribe', ['dev/PickingRequest']);
      });
    };

    Sockets.on('connect', sockAuth);

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
        window.localStorage.setItem('currentPickerId',user.id);
        $rootScope.$broadcast('auth-login', currentUser);
        if (me.redirectTo) {
          $state.go(me.redirectTo.state, me.redirectTo.params);
          me.redirectTo = false;
        } else {
          $state.go('home');
        }
      },

      init: init

    };

  });

})();
