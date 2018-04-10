(function (module) {

  const egaisPopover = {

    bindings: {
      shipment: '<',
      popoverOpen: '=?',
      egais: '<?'
    },

    transclude: true,

    controller: egaisPopoverController,
    templateUrl: 'app/domain/components/egaisPopover/egaisPopover.html',
    controllerAs: 'vm'

  };

  function egaisPopoverController() {

    const vm = _.assign(this, {
      $onInit: $onInit,
      format: {
        sameDay: '[Сегодня] [в] HH:mm',
        lastDay: '[Вчера] [в] HH:mm',
        sameElse: 'DD/MM/YYYY [в] HH:mm'
      }
    });

    function $onInit() {
      vm.egais = vm.egais || vm.shipment.egaisCached();
    }

  }


  module.component('egaisPopover', egaisPopover);

})(angular.module('Sales'));
