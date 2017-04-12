'use strict';

(() => {

  angular.module('core.services').service('UnsyncedInfoService', $window => {

    return {

      bind: (unsyncedInfo) => {

        function unsyncedInfoCallback(obj) {
          unsyncedInfo(obj);
        }

        $window.unsyncedInfoCallback = unsyncedInfoCallback;

        if ($window.webkit) {
          $window.webkit.messageHandlers.unsyncedInfoService.postMessage({
            unsyncedInfoCallback: 'unsyncedInfoCallback'
          });
          return true;
        }

      }

    };

  });

})();
