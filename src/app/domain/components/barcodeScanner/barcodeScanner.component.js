(function () {

  angular.module('webPage')
    .component('barcodeScanner', {

      bindings: {
        barcode: '=?ngModel',
        scanHandler: '&onScan',
        requiredType: '<',
        isEnabled: '=?'
      },

      /** @ngInject */
      controller($scope, DEBUG, Schema, $timeout, toastr, IOS, BarCodeScanner, $rootScope) {

        const { BARCODE_SCAN_EVENT } = BarCodeScanner;

        const vm = _.assign(this, {
          $onInit() {

            const { BarCodeType } = Schema.models();

            BarCodeType.findAll();
            BarCodeType.bindAll({}, $scope, 'vm.types');

            vm.iosMode = IOS.isIos();

            if (vm.iosMode) {
              BarCodeScanner.bind(onScan);
              $scope.$watch(() => BarCodeScanner.state.status, status => {
                // console.warn('BarCodeScanner:', status);
                vm.isEnabled = (status === 'connected')
              });
            } else {
              vm.isEnabled = false;
            }

          },
          enterPress() {
            vm.input && onScan(translateHIDScan(vm.input));
          },
          onPaste() {
            $timeout(this.enterPress);
          },
          toggleEnableClick() {
            if (vm.iosMode) {
              if (vm.isEnabled) {
                BarCodeScanner.unbind();
              } else {
                BarCodeScanner.bind(onScan);
              }
            } else {
              vm.isEnabled = !vm.isEnabled;
            }
          },
          isEnabled: true,
        });

        // $scope.$watch('vm.input', onInput);
        $scope.$watch('vm.barcode', barcode => {
          vm.input = '';
          if (!barcode) return;
          DEBUG('barcodeScanner:', barcode);
        });

        function onScan(code) {

          const type = detectType(code);

          const { requiredType, scanHandler } = vm;

          if (requiredType && (!type || type.type !== requiredType)) {
            vm.input = '';
            return toastr.error(code, 'Неверный тип штрих-кода');
          }

          scanHandler({ $barcode: vm.barcode = { code, type } });
          $rootScope.$broadcast(BARCODE_SCAN_EVENT, { code, type });

        }

        function detectType(code) {
          return _.find(vm.types, type => type.match(code));
        }

      },

      templateUrl: 'app/domain/components/barcodeScanner/barcodeScanner.html',
      controllerAs: 'vm',

    });

  const RU_LETTERS = 'фисвуапршолдьтщзйкыегмцчняФИСВУАПРШОЛДЬТЩЗЙКЫЕГМЦЧНЯ';
  const ENG_LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const RU_LETTERS_RE = new RegExp(`[${RU_LETTERS}]`, 'g');

  function translateFn(c) {
    const pos = RU_LETTERS.indexOf(c);
    return pos >= 0 ? ENG_LETTERS[pos] : c;
  }

  function translateHIDScan(barcode) {
    return barcode.replace(RU_LETTERS_RE, translateFn);
  }

})();
