(function () {

  angular.module('core.services').service('BarCodeScanner', BarCodeScannerService);

  const BARCODE_SCANNER_FN = 'barCodeScannerFn';
  const BARCODE_SCANNER_POWER_FN = 'barCodeScannerPowerFn';
  const BARCODE_SCANNER_STATUS_FN = 'barCodeScannerStatusFn';

  function BarCodeScannerService($window, IOS, $rootScope) {

    const state = {
      status: undefined
    };

    return {

      state,

      unbind() {
        IOS.handler('barCodeScannerOff')
          .postMessage({});
      },

      bind(scanFn, powerFn) {

        function scanProcessor(code, type, obj) {
          scanFn(code, type, obj);
        }

        function barCodeScannerPowerFn() {
          powerFn();
        }

        $window[BARCODE_SCANNER_FN] = scanProcessor;
        $window[BARCODE_SCANNER_POWER_FN] = barCodeScannerPowerFn;
        $window[BARCODE_SCANNER_STATUS_FN] = onStatusChange;

        if (IOS.isIos()) {
          IOS.handler('barCodeScannerOn').postMessage({
            scanCallback: BARCODE_SCANNER_FN,
            powerButtonCallback: BARCODE_SCANNER_POWER_FN,
            statusCallback: BARCODE_SCANNER_STATUS_FN
          });
        }

      }

    };

    function onStatusChange(newStatus) {
      $rootScope.$applyAsync(() => state.status = newStatus);
    }

  }

})();
