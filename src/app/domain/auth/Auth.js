'use strict';

(function () {

  angular.module('core.services').service('Auth', function ($rootScope, $q, $state, Sockets, $window, IOS, PickerAuth) {

    var DEBUG = debug ('stg:Auth');

    var me = this;

    var roles;
    var rolesArray;
    var rolesPromise;
    var resolveRoles;
    var currentUser;

    var ios = IOS.isIos();

    function getAccessToken() {
      return ios || $window.localStorage.getItem('authorization');
    }

    function clearAccessToken() {
      return ios || $window.localStorage.removeItem('authorization');
    }

    function setRoles(newRoles) {

      roles = newRoles || {};
      currentUser = roles.account || {};

      currentUser.shortName = (function (name) {
        var names = name.match (/(^[^ ]*) (.*$)/);
        return names[1] + ' ' + names[2][0] + '.';
      })(currentUser.name);

      rolesArray = _.map(roles.roles, function(val,key) {
        return key;
      });

      return roles;

    }

    function init(authProtocol) {

      if (rolesPromise) {
        return rolesPromise;
      }

      var token = getAccessToken();

      if (token && !roles || ios) {

        rolesPromise = authProtocol.getRoles(token)
          .then(function(res){
            console.log ('Auth.init',res);
            return setRoles(res);
          });

        return rolesPromise;

      } else if (roles) {

        rolesPromise = $q(function(resolve){
          resolve(roles);
        });

        return rolesPromise;

      } else {

        return $q(function(resolve){
          resolveRoles = resolve;
        });

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

        }
      } else {
        me.profileState = 'profile';
      }

    });

    var onAuthenticated = $rootScope.$on('authenticated', function (event, res) {
      console.log ('authenticated', res);
      setRoles(res);
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

    return angular.extend(me, {

      getCurrentUser: function () {
        return PickerAuth.getCurrentUser() || currentUser;
      },

      isLoggedIn: function () {
        return !!currentUser;
      },

      isAdmin: function () {
        return true;
      },

      logout: function () {
        currentUser = roles = undefined;
        clearAccessToken();
        $rootScope.$broadcast('auth-logout');
        $state.go('home');
      },

      init: init,

      roles: function() {
        return roles && roles.roles;
      },

      isAuthorized: function (anyRoles) {
        if (anyRoles && !angular.isArray(anyRoles)) {
          anyRoles = [anyRoles];
        }
        return roles && !anyRoles ||
          !!_.intersection (anyRoles,rolesArray).length
        ;
      }

    });

  });

})();
