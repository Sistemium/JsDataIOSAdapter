'use strict';

(function (module) {

  module.component('makeShipmentPointPhoto', {

    bindings: {
      isPopoverOpen: '='
    },

    templateUrl: 'app/domain/components/makeShipmentPointPhoto/makeShipmentPointPhoto.html',

    controller: makeShipmentPointPhotoController,
    controllerAs: 'vm'

  });


  function makeShipmentPointPhotoController() {

    const vm = _.assign(this, {
      onSubmit,
      triggerClick
    });

    function onSubmit() {
      vm.isPopoverOpen = false;
    }

    function triggerClick() {
      vm.isPopoverOpen = !vm.isPopoverOpen;
    }

  }

})(angular.module('Sales'));
