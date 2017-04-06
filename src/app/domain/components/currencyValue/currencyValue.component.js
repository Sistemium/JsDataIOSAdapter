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

  }

})(angular.module('webPage'));
