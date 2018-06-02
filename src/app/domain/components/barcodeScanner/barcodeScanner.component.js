(function () {

  angular.module('webPage')
    .component('barcodeScanner', {

      bindings: {
        barcode: '=?ngModel',
        scanHandler: '&onScan',
      },

      /** @ngInject */
      controller($scope, DEBUG, Schema) {

        const vm = _.assign(this, {
          $onInit() {
            const { BarCodeType } = Schema.models();
            BarCodeType.findAll();
            BarCodeType.bindAll({}, $scope, 'vm.types');
          },
          enterPress() {
            onScan(translateHIDScan(vm.input));
          }
        });

        // $scope.$watch('vm.input', onInput);
        $scope.$watch('vm.barcode', barcode => {
          vm.input = '';
          if (!barcode) return;
          DEBUG('barcodeScanner:', barcode);
        });

        function onScan(code) {
          vm.barcode = { code, type: detectType(code) };
          vm.scanHandler({ $barcode: vm.barcode });
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

  function translateFn (c) {
    const pos = RU_LETTERS.indexOf(c);
    return pos >= 0 ? ENG_LETTERS[pos] : c;
  }

  function translateHIDScan(barcode) {
    return barcode.replace(RU_LETTERS_RE, translateFn);
  }

})();
