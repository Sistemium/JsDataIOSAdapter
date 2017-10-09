(function (module) {

  module.component('settingsPopover', {

    bindings: {},

    controller: settingsPopoverController,
    controllerAs: 'vm',

    templateUrl: 'app/domain/components/settingsPopover/settingsPopover.html'

  });

  function settingsPopoverController($scope, $rootScope, localStorageService) {

    const items = ['showFirstLevel', 'showImages', 'hideBoxes'];

    const vm = _.assign(this, {
      $onInit
    });

    $scope.$watch('vm.isPopoverOpen', isPopoverOpen => {
      $rootScope.$broadcast('settingsPopoverOpen', isPopoverOpen);
    });

    function $onInit() {
      _.each(items, item => {
        $rootScope[name] = vm[item] = localStorageService.get(item) || false;
        vm[`${item}Click`] = () => toggleItemClick(item);
      });
    }

    function toggleItemClick(name) {
      localStorageService.set(name, vm[name] = !vm[name]);
      $rootScope[name] = vm[name];
    }

  }

})(angular.module('webPage'));
