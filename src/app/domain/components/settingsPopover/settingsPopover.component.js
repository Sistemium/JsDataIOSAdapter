(function (module) {

  module.component('settingsPopover', {

    bindings: {},

    controller: settingsPopoverController,
    controllerAs: 'vm',

    templateUrl: 'app/domain/components/settingsPopover/settingsPopover.html'

  });

  function settingsPopoverController($scope, $rootScope) {

    $scope.$watch('vm.isPopoverOpen', isPopoverOpen => {
      $rootScope.$broadcast('settingsPopoverOpen', isPopoverOpen);
    });

  }

})(angular.module('webPage'));
