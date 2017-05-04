(function (module) {

  const driverPopover = {

    bindings: {
      driver: '<',
      popoverOpen: '='
    },

    transclude: true,

    templateUrl: 'app/domain/components/driverPopover/driverPopover.html',
    controllerAs: 'vm'

  };

  module.component('driverPopover', driverPopover);

})(angular.module('Sales'));
