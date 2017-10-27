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

      let where = {
        outletId: {'==': vm.saleOrder.outletId},
        salesmanId: {'==': vm.saleOrder.salesmanId}
      };

      vm.busy = OutletSalesmanContract.findAllWithRelations({where})()
        .then(res => {

          vm.currentOption = _.find(res, {contractId: vm.saleOrder.contractId});

          if (vm.currentOption) return;

          if (res.length === 1) {
            return optionClick(res[0]);
          }

          vm.saleOrder.contractId = null;
          vm.saleOrder.priceTypeId = null;
          vm.isOpen = true;

        })
        .finally(() => vm.busy = false);

      where.contractId = {'!=': null};

      OutletSalesmanContract.bindAll({where}, $scope, 'vm.data');

    }

    function optionClick(osc) {
      vm.isOpen = false;
      vm.currentOption = osc;
      vm.saleOrder.contractId = osc.contractId;
      vm.saleOrder.priceTypeId = osc.priceTypeId;
    }

  }

})(angular.module('Sales'));
