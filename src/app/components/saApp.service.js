'use strict';

(function () {

  function saApp($window, Schema) {

    var appIdKey = 'saAppId';
    var version = '0.4.1';

    var appId = $window.localStorage.getItem(appIdKey);

    if (!appId) {
      appId = uuid.v4();
      $window.localStorage.setItem(appIdKey, appId)
    }

    function init() {

      var LogMessage = Schema.model('LogMessage');
      var logMsg = {
        event: 'appInit',
        appName: 'j-sistemium',
        appId: appId,
        version: version
      };

      LogMessage.create({
        text: angular.toJson(logMsg),
        type: 'important',
        source: 'jsdata'
      });

    }

    return {
      init: init,
      version: function () {
        return version;
      }
    };

  }

  angular.module('core.services')
    .service('saApp', saApp);

})();
