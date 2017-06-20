'use strict';

(function () {

  function Auth($rootScope, $q, $state, $window, IOS, PickerAuth) {

    const me = this;

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

      currentUser.shortName = (name => {
        const names = name.match (/(^[^ ]*) (.*$)/);
        return names ? names[1] + ' ' + names[2][0] + '.' : name;
      })(currentUser.name);

      rolesArray = _.map(roles.roles, (val,key) => {
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
          .then(res => {
            console.log ('Auth.init',res);
            return setRoles(res);
          });

        return rolesPromise;

      } else if (roles) {

        rolesPromise = $q(resolve => {
          resolve(roles);
        });

        return rolesPromise;

      } else {

        return $q(resolve => {
          resolveRoles = resolve;
        });

      }

    }

    function isAuthorized(anyRoles) {
      if (anyRoles && !angular.isArray(anyRoles)) {
        anyRoles = [anyRoles];
      }
      return roles && !anyRoles ||
        !!_.intersection(anyRoles, rolesArray).length
        ;
    }

    $rootScope.$on('$stateChangeStart', (event, next, nextParams, from) => {

      if (!roles) {
        if (next.name !== 'auth') {

          event.preventDefault();
          if (rolesPromise) {
            rolesPromise.then(() => {
              $state.go(next, nextParams);
            });
            return;
          }

          $state.go('auth');

        }
      } else {
        me.profileState = 'profile';
        if (_.get(next, 'data.auth') === 'pickerAuth') {
          me.profileState = 'picker';
        }
      }

      let needRoles = _.get(next, 'data.auth');

      if (needRoles && !event[needRoles]) {
        console.warn(`Should be prevented state change to ${next.name} from ${from.name} by ${needRoles}`);
      }

    });

    $rootScope.$on('authenticated', (event, res) => {
      console.log ('authenticated', res);
      setRoles(res);
      if (resolveRoles) {
        resolveRoles(roles);
      }
      $window.localStorage.setItem('authorization', res.accessToken);
    });

    return angular.extend(me, {

      getCurrentUser: () => {
        return me.profileState === 'picker' && PickerAuth.getCurrentUser() || currentUser;
      },

      getAccount: () => {
        return currentUser;
      },

      isLoggedIn: () => {
        return !!currentUser;
      },

      isAdmin: function () {
        return isAuthorized(['admin', 'tester']);
      },

      init,

      getAccessToken,


      isAuthorized,

      authId: function() {
        return currentUser.authId;
      },

      roles: () => {
        return roles && roles.roles;
      }

    });

  }

  angular.module('core.services').service('Auth', Auth);

})();
