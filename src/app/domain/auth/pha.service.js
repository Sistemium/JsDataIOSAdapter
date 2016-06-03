'use strict';

(function () {

  angular.module('core.services').service('phaService', phaService);

  function phaService ($http,$rootScope) {

    var
      url = 'https://api.sistemium.com/pha/auth',
      logoffUrl = 'https://api.sistemium.com/pha/logoff',
      rolesUrl = 'https://api.sistemium.com/pha/roles',
      ID
    ;

    var me = {};

    function auth (mobileNumber) {
      return $http
        .post(url, null, {params: {mobileNumber: mobileNumber}})
        .success(function (res){
          if (res && res.ID) {
            ID = res.ID;
          }
        })
      ;
    }

    function logoff (token) {
      return $http
        .get(logoffUrl, {
          headers: {
            'Authorization': token
          },
          timeout: 4000
        })
      ;
    }

    function confirm (code) {
      return $http
        .post(url, null, {params: {ID: ID, smsCode: code}})
        .success(function (res) {
          console.log (res);
          getRoles(res.accessToken);
        })
      ;
    }

    function getRoles (token) {
      return $http
        .get(rolesUrl, {
          headers: {
            Authorization: token
          },
          timeout: 15000
        })
        .then(function(httpResponse){
          var res = httpResponse.data;
          var response = {
            accessToken: token,
            roles: res.roles,
            account: res.account
          };
          me.roles = res.roles;
          me.account = res.account;
          $rootScope.$broadcast('authenticated',response);
          return response;
        })
      ;
    }

    return angular.extend(me,{
      auth: auth,
      logoff: logoff,
      confirm: confirm,
      getRoles: getRoles
    });

  }

})();
