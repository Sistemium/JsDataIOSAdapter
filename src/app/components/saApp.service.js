'use strict';

(function () {

  function saApp($window, Schema, UUID) {

    const appIdKey = 'saAppId';
<<<<<<< HEAD
    const VERSION = '0.17.19';
=======
    const VERSION = '0.17.23';
>>>>>>> salesSchema

    let appId = $window.localStorage.getItem(appIdKey);

    if (!appId) {
      appId = UUID.v4();
      $window.localStorage.setItem(appIdKey, appId)
    }

    function init() {

      const LogMessage = Schema.model('LogMessage');
      const logMsg = {
        event: 'appInit',
        appName: 'j-sistemium',
        appId: appId,
        version: VERSION
      };

      LogMessage.create({
        text: angular.toJson(logMsg),
        type: 'important',
        source: 'jsdata'
      });

    }

    return {
      init,
      version: () => VERSION
    };

  }

  angular.module('core.services')
    .service('saApp', saApp);

})();
