'use strict';

(function () {

  angular.module('webPage').component('fontSizeEdit', {

    transclude: true,

    bindings: {
      appendTo: '@'
    },

    controller: fontSizeEditController,

    templateUrl: 'app/domain/components/fontSizeEdit/fontSizeEdit.html',
    controllerAs: 'vm'

  });

  function fontSizeEditController($scope, localStorageService) {

    let lsKey = 'fontSizeEdit';
    const vm = _.assign(this, {
      $onInit,
      incrementClick,
      decrementClick
    });

    function $onInit() {
      lsKey += `.${vm.appendTo}`;
      vm.fontSize = localStorageService.get(lsKey) || 13;

      $scope.$on('settingsPopoverOpen', (event, isPopoverOpen) => {
        vm.isShown = isPopoverOpen;
      });

    }

    $scope.$watch('vm.fontSize', function (nv, ov) {

      if (nv !== ov) {
        localStorageService.set(lsKey, nv);
      }

    });

    function incrementClick() {
      vm.fontSize = _.min([vm.fontSize + 1, 18])
    }

    function decrementClick() {
      vm.fontSize = _.max([vm.fontSize - 1, 13])
    }

  }

})();
