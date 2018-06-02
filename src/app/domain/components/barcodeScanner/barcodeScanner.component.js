(function () {

  angular.module('webPage')
    .component('barcodeScanner', {

      bindings: {
        barcode: '=?ngModel',
        scanHandler: '&onScan',
        requiredType: '<',
      },

      /** @ngInject */
      controller($scope, DEBUG, Schema, $timeout, toastr) {

        const vm = _.assign(this, {
          $onInit() {
            const { BarCodeType } = Schema.models();
            BarCodeType.findAll();
            BarCodeType.bindAll({}, $scope, 'vm.types');
          },
          enterPress() {
            onScan(translateHIDScan(vm.input));
          },
          onPaste() {
            $timeout(this.enterPress);
          }
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

          scanHandler({ $barcode: vm.barcode = { code, type }});

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
