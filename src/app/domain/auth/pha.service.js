'use strict';

(function () {

  angular.module('core.services').service('phaService', phaService);

  function phaService ($http,$rootScope) {

    var
      url = 'https://api.sistemium.com/pha/auth',
      logoffUrl = 'https://api.sistemium.com/pha/logoff',
      ID
    ;

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
          $rootScope.$broadcast('authenticated',res);
        })
      ;
    }

    return {
      auth: auth,
      logoff: logoff,
      confirm: confirm
    }

  }

})();
