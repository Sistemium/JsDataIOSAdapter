(function (module) {

  module.component('saleOrderDiscountPopover', {

    bindings: {
      saleOrder: '<'
    },

    templateUrl: 'app/domain/sales/saleOrder/saleOrderDiscountInfo/saleOrderDiscountPopover.html',

    controllerAs: 'vm',
    controller: saleOrderDiscountPopoverController

  });

  function saleOrderDiscountPopoverController(Schema, $scope) {

    const {SaleOrderDiscount} = Schema.models();

    const vm = _.assign(this, {
      $onInit
    });

    /*
    Functions
     */

    function $onInit() {

      let saleOrderId = vm.saleOrder.id;
      let orderBy = [['discountScope', 'DESC']];

      SaleOrderDiscount.bindAll({saleOrderId, orderBy}, $scope, 'vm.discounts');
      vm.busy = SaleOrderDiscount.findAllWithRelations({saleOrderId}, {bypassCache: true})(['PriceGroup', 'Article'])
        .finally(() => vm.busy = false);

    }

  }

})(angular.module('Sales'));
