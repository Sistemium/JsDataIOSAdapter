'use strict';

(function (module) {

  module.component('priceEdit', {

    bindings: {
      stock: '<'
    },

    templateUrl: 'app/domain/sales/priceEdit/priceEdit.html',

    controller: priceEditController,
    controllerAs: 'vm'

  });

  /** @ngInject */
  function priceEditController(saMedia, $uibModal, $scope) {

    let vm = this;

    _.assign(vm, {

      discountPercent,
      discountPercentDoc,
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
        templateUrl: 'app/domain/sales/priceEdit/priceEdit.modal.html',

        size: 'sm',
        windowClass: 'price-edit modal-info',
        scope: $scope,
        bindToController: false

      });

      vm.modal.result
        .then(_.noop, _.noop);

    }

    function discountPrice(target = '') {
      return vm.stock.discountPrice(target);
    }

    function discountPercent() {

      return -vm.stock.discountPercent();

    }

    function discountPercentDoc() {
      return -vm.stock.discountPercent(null, 'Doc');
    }

  }

})(angular.module('Sales'));
