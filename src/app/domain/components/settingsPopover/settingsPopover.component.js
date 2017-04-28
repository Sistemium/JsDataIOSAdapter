(function (module) {

  module.component('settingsPopover', {

    bindings: {},

    controller: settingsPopoverController,
    controllerAs: 'vm',

    templateUrl: 'app/domain/components/settingsPopover/settingsPopover.html'

  });

  function settingsPopoverController($scope, $rootScope, localStorageService) {

    const vm = _.assign(this, {
      $onInit
    });

    $scope.$watch('vm.isPopoverOpen', isPopoverOpen => {
      $rootScope.$broadcast('settingsPopoverOpen', isPopoverOpen);
    });

    function $onInit() {
      vm.showImages = localStorageService.get('showImages') || false;
    }

  }

})(angular.module('webPage'));
