(function (module) {


  module.component('saleOrderDiscountInfo', {

    bindings: {
      saleOrder: '<',
      discounts: '='
    },

    templateUrl: 'app/domain/sales/saleOrder/saleOrderDiscountInfo/saleOrderDiscountInfo.html',

    controller: saleOrderDiscountInfoController,
    controllerAs: 'vm'

  });

  function saleOrderDiscountInfoController(saMedia, $uibModal, $scope) {

    const vm = _.assign(this, {
      click,
      closeClick,
      popoverTrigger: popoverTrigger()
    });

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
        templateUrl: 'app/domain/sales/saleOrder/saleOrderDiscountInfo/saleOrderDiscountModal.html',

        size: 'sm',
        windowClass: 'sale-order-discount-modal modal-info',
        scope: $scope,
        bindToController: false

      });

    }

  }

})(angular.module('Sales'));
