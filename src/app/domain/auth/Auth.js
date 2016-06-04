'use strict';

(function () {

  angular.module('webPage').service('Auth', function ($rootScope, $q, $state, Sockets, $window, IOS) {

    var me = this;
    var currentUser;
    var DEBUG = debug ('stg:Auth');
    var roles;
    var rolesPromise;
    var ios = IOS.isIos();
    var resolveRoles;

    function getAccessToken() {
      return ios || $window.localStorage.getItem('authorization');
    }

    function init(authProtocol) {

      if (rolesPromise) {
        return rolesPromise;
      }

      var token = getAccessToken();

      if (token && !roles || ios) {

        rolesPromise = authProtocol.getRoles(token)
          .then(function(res){
            roles = res;
            console.log ('Auth.init',res);
            return res;
          });

        return rolesPromise;

      } else if (roles) {

        rolesPromise = $q(function(resolve){
          resolve(roles);
        });

        return rolesPromise;

      } else {

        var rolesPromise1 = $q(function(resolve){
          resolveRoles = resolve;
        });

        return rolesPromise1;

      }

    }

    var needAuth = $rootScope.$on('$stateChangeStart', function (event, next, nextParams) {

      if (!roles) {
        if (next.name !== 'auth') {

          event.preventDefault();
          if (rolesPromise) {
            rolesPromise.then(function () {
              $state.go(next, nextParams);
            });
            return;
          }

          $state.go('auth');
          return;

        } else {
          return;
        }
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
      console.log ('authenticated', res);
      roles = res;
      if (resolveRoles) {
        resolveRoles (roles);
      }
      $window.localStorage.setItem('authorization', res.accessToken);
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
        $rootScope.$broadcast ('socket:authorized');
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
        window.localStorage.removeItem('currentPickerId');
      },

      login: function (user) {
        if (!user || !user.id) {
          $window.localStorage.removeItem('currentPickerId');
          return $state.go('login');
        }
        currentUser = user;
        $window.localStorage.setItem('currentPickerId',user.id);
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
