'use strict';

(function () {

  angular.module('core.services').service('Auth', function ($rootScope, $q, $state, Sockets, $window, IOS, PickerAuth) {

    let me = this;

    let roles;
    let rolesArray;
    let rolesPromise;
    let resolveRoles;
    let currentUser;

    const ios = IOS.isIos();

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
        const names = name.match (/(^[^ ]*) (.*$)/);
        return names ? names[1] + ' ' + names[2][0] + '.' : name;
      })(currentUser.name);

      rolesArray = _.map(roles.roles, function(val,key) {
        return key;
      });

      if (!ios) {
        me.logout = logout
      }

      return roles;

    }

    function logout() {
      currentUser = rolesArray = roles = rolesPromise = false;
      clearAccessToken();
      $rootScope.$broadcast('auth-logout');
      $state.go('home');
    }

    function init(authProtocol) {

      if (rolesPromise) {
        return rolesPromise;
      }

      const token = getAccessToken();

      if (!roles && (token || ios)) {

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

    $rootScope.$on('$stateChangeStart', function (event, next, nextParams, from) {

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
        if (_.get(next,'data.auth') === 'pickerAuth') {
          me.profileState = 'picker';
        }
      }

      let needRoles = _.get(next, 'data.auth');

      if (needRoles && !event[needRoles]) {
        console.warn(`Should be prevented state change to ${next.name} from ${from.name} by ${needRoles}`);
      }

    });

    $rootScope.$on('authenticated', function (event, res) {
      console.log ('authenticated', res);
      setRoles(res);
      if (resolveRoles) {
        resolveRoles (roles);
      }
      $window.localStorage.setItem('authorization', res.accessToken);
    });

    return angular.extend(me, {

      getCurrentUser: function () {
        return me.profileState === 'picker' && PickerAuth.getCurrentUser() || currentUser;
      },

      getAccount: function () {
        return currentUser;
      },

      isLoggedIn: function () {
        return !!currentUser;
      },

      isAdmin: function () {
        return true;
      },

      init,

      getAccessToken,

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
