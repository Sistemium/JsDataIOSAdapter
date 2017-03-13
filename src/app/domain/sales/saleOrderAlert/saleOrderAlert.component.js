'use strict';

(function (SalesModule) {

  SalesModule.component('saleOrderAlert', {

      transclude: {
        popovers: '?popovers',
        buttons: '?buttons',
        totals: '?totals'
      },

      bindings: {
        saleOrderExpanded: '=expanded',
        saleOrder: '='
      },

      controller: saleOrderAlertController,

      templateUrl: 'app/domain/sales/saleOrderAlert/saleOrderAlert.html',
      controllerAs: 'vm'

    });


  function saleOrderAlertController(Schema, toastr, $state, $timeout) {

    const {SaleOrder} = Schema.models();

    const vm = this;

    _.assign(vm, {
      deleteSaleOrderClick
    });


    function deleteSaleOrderClick() {

      if (!vm.saleOrder.id) {
        return $state.go('^');
      }

      vm.confirmDelete = !vm.confirmDelete;

      if (!vm.confirmDelete) {
        vm.confirmDelete = false;
        SaleOrder.destroy(vm.saleOrder.id)
          .then(() => $state.go('^'))
          .catch(err => toastr.error(angular.toJson(err)));
      } else {
        $timeout(2000)
          .then(() => vm.confirmDelete = false);
      }

    }

  }

})(angular.module('Sales'));
