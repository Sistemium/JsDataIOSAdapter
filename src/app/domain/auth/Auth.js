'use strict';

(function () {

  function Auth($rootScope, $q, $state, $window, IOS, PickerAuth) {

<<<<<<< HEAD
    const me = this;
=======
    let me = this;
>>>>>>> warehouse

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

<<<<<<< HEAD
      currentUser.shortName = (function (name) {
        var names = name.match(/(^[^ ]*) (.*$)/);
        return names ? names[1] + ' ' + names[2][0] + '.' : name;
      })(currentUser.name);

      rolesArray = _.map(roles.roles, function (val, key) {
=======
      currentUser.shortName = (name => {
        const names = name.match (/(^[^ ]*) (.*$)/);
        return names ? names[1] + ' ' + names[2][0] + '.' : name;
      })(currentUser.name);

      rolesArray = _.map(roles.roles, (val,key) => {
>>>>>>> warehouse
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
<<<<<<< HEAD
          .then(function (res) {
            console.log('Auth.init', res);
=======
          .then(res => {
            console.log ('Auth.init',res);
>>>>>>> warehouse
            return setRoles(res);
          });

        return rolesPromise;

      } else if (roles) {

<<<<<<< HEAD
        rolesPromise = $q(function (resolve) {
=======
        rolesPromise = $q(resolve => {
>>>>>>> warehouse
          resolve(roles);
        });

        return rolesPromise;

      } else {

<<<<<<< HEAD
        return $q(function (resolve) {
=======
        return $q(resolve => {
>>>>>>> warehouse
          resolveRoles = resolve;
        });

      }

    }

<<<<<<< HEAD
    function isAuthorized(anyRoles) {
      if (anyRoles && !angular.isArray(anyRoles)) {
        anyRoles = [anyRoles];
      }
      return roles && !anyRoles ||
        !!_.intersection(anyRoles, rolesArray).length
        ;
    }

=======
>>>>>>> warehouse
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
<<<<<<< HEAD
      console.log('authenticated', res);
=======
      console.log ('authenticated', res);
>>>>>>> warehouse
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

<<<<<<< HEAD
      isAdmin: function () {
        return isAuthorized(['admin', 'tester']);
=======
      isAdmin: () => {
        return true;
>>>>>>> warehouse
      },

      init,

      getAccessToken,

<<<<<<< HEAD
      roles: function () {
        return roles && roles.roles;
      },

      isAuthorized,
      authId: function() {
        return currentUser.authId;
=======
      roles: () => {
        return roles && roles.roles;
      },

      isAuthorized: anyRoles => {
        if (anyRoles && !angular.isArray(anyRoles)) {
          anyRoles = [anyRoles];
        }
        return roles && !anyRoles ||
          !!_.intersection (anyRoles,rolesArray).length
        ;
>>>>>>> warehouse
      }

    });

  }

  angular.module('core.services').service('Auth', Auth);

})();
