'use strict';

(function () {

    angular.module('core.services').service('BarCodeScanner', function ($window) {


      return {

        bind: function (scanFn) {

          function scanProcessor (code, type, obj) {
            if (obj && type) {
              obj.type = type;
            }
            scanFn (code, type, obj);
          }

          $window.barCodeScannerFn = scanProcessor;

          if ($window.webkit) {
            $window.webkit.messageHandlers.barCodeScannerOn.postMessage('barCodeScannerFn');
            return true;
          }

        }

      };

    });

})();
