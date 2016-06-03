'use strict';

(function () {

  angular.module('webPage').service('Auth', function ($rootScope, $q, $state, Sockets, $window) {

    var me = this;
    var currentUser;
    var DEBUG = debug ('stg:Auth');
    var roles;
    var rolesPromise;

    function getAccessToken() {
      return !!$window.webkit || $window.localStorage.getItem('authorization');
    }

    function init(authProtocol) {
      if (rolesPromise) {
        return rolesPromise;
      }
      var token = getAccessToken();
      if (token && !roles) {
        rolesPromise = authProtocol.getRoles(token)
          .then(function(res){
            //roles = res.roles;
            console.log ('Auth.init',res);
            return res;
          });
        return rolesPromise;
      } else if (roles) {
        return $q(function(resolve){
          resolve(roles);
        });
      }
    }

    var needAuth = $rootScope.$on('$stateChangeStart', function (event, next, nextParams) {

      if (!roles && next.name !== 'auth') {
        event.preventDefault();
        if (rolesPromise) {
          rolesPromise.then(function(){
            $state.go(next,nextParams);
          });
          return;
        }
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
      roles = res.roles;
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
