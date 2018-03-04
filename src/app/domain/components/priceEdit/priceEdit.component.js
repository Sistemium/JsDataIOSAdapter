'use strict';

(function (module) {

  const priceEdit = {

    bindings: {
      stock: '<'
    },

    templateUrl: 'app/domain/components/priceEdit/priceEdit.html',

    controller: priceEditController,
    controllerAs: 'vm'

  };

  /** @ngInject */
  function priceEditController(saMedia, $uibModal, $scope) {

    let vm = this;

    _.assign(vm, {

      discountPercent,
      discountPrice,
      click,
      closeClick,
      popoverTrigger: popoverTrigger()

    });

    /*
     Functions
     */

    function closeClick() {
      _.result(vm.modal, 'close');
    }

    function popoverTrigger() {
      return (saMedia.xsWidth || saMedia.xxsWidth) ? 'none' : 'outsideClick';
    }

    function click() {

      if (vm.popoverTrigger !== 'none') {
        return;
      }

      vm.modal = $uibModal.open({

        animation: false,
        templateUrl: 'app/domain/components/priceEdit/priceEdit.modal.html',

        size: 'sm',
        windowClass: 'price-edit modal-info',
        scope: $scope,
        bindToController: false

      });

    }

    function discountPrice(target = '') {
      return vm.stock.discountPrice(target);
    }

    function discountPercent() {

      return - vm.stock.discountPercent();

    }

  }

  module.component('priceEdit', priceEdit);

})(angular.module('Sales'));
