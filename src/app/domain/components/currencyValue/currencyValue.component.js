(function (module) {

  module.component('currencyValue', {

    bindings: {
      hideEmpty: '<',
      value: '<',
      label: '@'
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
