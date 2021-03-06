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

        const { BARCODE_SCAN_EVENT, BARCODE_SCAN_INVALID } = BarCodeScanner;

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

            vm.requiredTypes = [];

            const { requiredType } = vm;

            if (_.isArray(requiredType)) {
              vm.requiredTypes = requiredType;
            } else if (requiredType) {
              vm.requiredTypes.push(requiredType);
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

          const { requiredTypes, scanHandler } = vm;

          if (requiredTypes.length && (!type || requiredTypes.indexOf(type.type) < 0)) {
            vm.input = '';
            $rootScope.$broadcast(BARCODE_SCAN_INVALID, { code, type });
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
    barcode = _.replace(barcode, / /g, '');
    return barcode.replace(RU_LETTERS_RE, translateFn);
  }

})();
