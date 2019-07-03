(function () {

  angular.module('webPage')
    .component('pickedPalette', {

      bindings: {
        title: '@',
        boxes: '<',
      },

      templateUrl: 'app/domain/picking/pickedPalette/pickedPalette.html',
      controller: PickedPaletteController,
      controllerAs: 'vm'

    });

  function PickedPaletteController() {

    _.assign(this, {

      $onInit() {

      },

      boxClick() {

      },

    });

  }

})();
