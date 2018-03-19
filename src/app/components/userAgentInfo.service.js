(function () {

  angular.module('webPage')
    .service('userAgentInfo', userAgentInfo);

  function userAgentInfo($window) {

    const me = {};

    let res = updateInfo(me);

    delete $window.UAParser;

    return res;

    function updateInfo(info) {

      const ua = new $window.UAParser();

      return _.assign(info, {
        osInfo: ua.getOS(),
        deviceInfo: ua.getDevice()
      });

    }

  }

})();
