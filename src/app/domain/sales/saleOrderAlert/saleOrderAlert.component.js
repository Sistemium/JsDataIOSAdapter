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
      saleOrder: '=',
      discounts: '='
    },

    controller: saleOrderAlertController,

    templateUrl: 'app/domain/sales/saleOrderAlert/saleOrderAlert.html',
    controllerAs: 'vm'

  });


  function saleOrderAlertController(Schema, $scope, toastr, $state, $timeout, DomainOption) {

    const { SaleOrder } = Schema.models();

    const vm = this;

    // TODO: consider weekends
    const nextWorkDay = moment().add(1, 'day').toDate();

    _.assign(vm, {

      rnkOption: DomainOption.rnkOption(),
      deleteSaleOrderClick,
      saleOrderMinDate: moment().toDate(),
      saleOrderInitDate: nextWorkDay,

      $onInit() {
        $scope.$watch('vm.saleOrder.target', () => {
          vm.useRNK = _.get(vm.saleOrder, 'target') === 'rnk';
        });
        $scope.$watch('vm.useRNK', () => this.onRNK());
      },

      onRNK() {
        if (!vm.saleOrder) {
          return;
        }
        vm.saleOrder.target = vm.useRNK ? 'rnk' : null;
      },

    }, DomainOption.saleOrderOptions());

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
