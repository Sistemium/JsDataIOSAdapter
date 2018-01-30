(function (module) {

  const driverPopover = {

    bindings: {
      driver: '<',
      popoverOpen: '='
    },

    templateUrl: 'app/domain/components/driverPopover/driverPopover.html',
    controllerAs: 'vm'

  };

  module.component('driverPopover', driverPopover);

})(angular.module('Sales'));
