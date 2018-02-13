(function (module) {

  module.component('currencyValue', {

    bindings: {
      hideEmpty: '<',
      value: '<',
      label: '@',
      currency: '@'
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

    vm.currency = vm.currency || '₽';

  }

})(angular.module('webPage'));
