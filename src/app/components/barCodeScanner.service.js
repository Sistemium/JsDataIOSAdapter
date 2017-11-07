'use strict';

(function () {

    angular.module('core.services').service('BarCodeScanner', function ($window, IOS) {

      return {

        bind: function (scanFn, powerFn) {

          function scanProcessor (code, type, obj) {
            scanFn (code, type, obj);
          }

          function barCodeScannerPowerFn () {
            powerFn ();
          }

          $window.barCodeScannerFn = scanProcessor;
          $window.barCodeScannerPowerFn = barCodeScannerPowerFn;

          if (IOS.isIos()) {
            IOS.handler('barCodeScannerOn').postMessage({
              scanCallback: 'barCodeScannerFn',
              powerButtonCallback: 'barCodeScannerPowerFn'
            });
            return true;
          }

        }

      };

    });

})();
