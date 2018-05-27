(function () {

  angular.module('webPage')
    .component('barcodeScanner', {

      bindings: {
        barcode: '=ngModel',
      },

      controller($scope) {

        const vm = this;
        $scope.$watch('vm.input', onInput);


        function onInput(code) {
          vm.barcode = {code};
        }

      },

      templateUrl: 'app/domain/components/barcodeScanner/barcodeScanner.html',
      controllerAs: 'vm',

    });

})();
