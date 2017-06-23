(function (module) {

  module.component('currencyValue', {

    bindings: {
      hideEmpty: '<',
      value: '<',
      label: '@',
      weight: '@'
    },

    controller: currencyValueController,
    controllerAs: 'vm',

    templateUrl: 'app/domain/components/currencyValue/currencyValue.html'

  });

  function currencyValueController() {

    let vm = this;

    if (!vm.weight) {
      vm.weight = 600
    }

  }

})(angular.module('webPage'));
