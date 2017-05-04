'use strict';

(function (module) {

  module.component('outletSalesmanContractPopover', {

      bindings: {
        saleOrder: '<'
      },

      controller: outletSalesmanContractPopoverController,

      templateUrl: 'app/domain/sales/outletSalesmanContract/outletSalesmanContractPopover.html',
      controllerAs: 'vm'

    });


  function outletSalesmanContractPopoverController(Schema, $scope) {

    const {OutletSalesmanContract} = Schema.models();

    const vm = this;

    _.assign(vm, {
      currentOption: null,
      optionClick,
      $onInit
    });

    function $onInit () {
      $scope.$watchGroup(['vm.saleOrder.salesmanId', 'vm.saleOrder.outletId'], onSaleOrderChange);
    }

    function onSaleOrderChange() {

      let filter = {
        outletId: vm.saleOrder.outletId,
        salesmanId: vm.saleOrder.salesmanId
      };

      vm.busy = OutletSalesmanContract.findAllWithRelations(filter)()
        .then(res => {
          vm.currentOption = _.find(res, {contractId: vm.saleOrder.contractId});
          if (res.length && !vm.currentOption) {
            optionClick(res[0]);
          }
        })
        .finally(() => vm.busy = false);

      OutletSalesmanContract.bindAll(filter, $scope, 'vm.data');

    }

    function optionClick(osc) {
      vm.currentOption = osc;
      vm.saleOrder.contractId = osc.contractId;
      vm.saleOrder.priceTypeId = osc.priceTypeId;
    }

  }

})(angular.module('webPage'));
