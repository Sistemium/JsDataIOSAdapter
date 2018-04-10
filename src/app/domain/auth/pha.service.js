'use strict';

(function () {

  angular.module('core.services')
    .service('phaService', phaService);

  function phaService($http, $rootScope) {

    const url = 'https://api.sistemium.com/pha/auth';
    const logoffUrl = 'https://api.sistemium.com/pha/logoff';
    const rolesUrl = 'https://api.sistemium.com/pha/roles';

    let ID;

    const me = {};

    return _.assign(me, {
      auth,
      logoff,
      confirm,
      getRoles
    });

    /*
    Functions
     */

    function auth(mobileNumber) {
      return $http
        .post(url, null, {params: {mobileNumber: mobileNumber}})
        .then(function (res) {
          if (res.data && res.data.ID) {
            ID = res.data.ID;
          }
        });
    }

    function logoff(token) {
      return $http
        .get(logoffUrl, {
          headers: {
            'Authorization': token
          },
          timeout: 4000
        });
    }

    function confirm(code) {

      return $http.post(url, null, {params: {ID: ID, smsCode: code}})
        .then(function (res) {
          return getRoles(res.data.accessToken);
        });

    }

    function getRoles(token) {

      let params = {
        headers: {
          Authorization: token
        },
        timeout: 15000
      };

      return $http.get(rolesUrl, params)
        .then(httpResponse => {

          const res = httpResponse.data;
          const response = {
            accessToken: token,
            roles: res.roles,
            account: res.account
          };

          me.roles = res.roles;
          me.account = res.account;

          $rootScope.$broadcast('authenticated', response);

          return response;

        });
    }

  }

})();
