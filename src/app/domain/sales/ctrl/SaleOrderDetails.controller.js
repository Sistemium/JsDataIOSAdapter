'use strict';

(function () {

  function SaleOrderDetailsController(Schema, $scope, saControllerHelper, $state, $q, toastr) {

    const vm = saControllerHelper.setup(this, $scope);
    const {SaleOrderPosition, SaleOrder, Contract, PriceType} = Schema.models();

    vm.use({

      toggleEditClick: () => vm.editing = !vm.editing,

      setProcessingClick

    });

    /*
     Init
     */

    vm.setBusy(getData());

    /*
     Listeners
     */

    SaleOrder.bindOne($state.params.id, $scope, 'vm.saleOrder', _.debounce(safeSave,700));

    /*
     Functions
     */

    function setProcessingClick(processing) {

      vm.saleOrder.processing = processing;
      vm.saleOrder.DSCreate()
        .then(() => toastr.info(_.get(vm.saleOrder.workflow(), 'desc'), 'Статус заказа изменен'))
        .catch(e => toastr.info(angular.toJson(e), 'Ошибка сохранения'));

    }

    function safeSave () {
      return vm.saleOrder && vm.saleOrder.safeSave();
    }

    function getData() {

      return SaleOrder.find($state.params.id)
        .then(saleOrder => SaleOrder.loadRelations(saleOrder))
        .then(saleOrder => {

          Contract.find(saleOrder.contractId);
          PriceType.find(saleOrder.priceTypeId);

          return $q.all(_.map(saleOrder.positions, position => {
            SaleOrderPosition.loadRelations(position)
          }))
        })
        .catch(e => console.error(e));

    }

  }

  angular.module('webPage')
    .controller('SaleOrderDetailsController', SaleOrderDetailsController);

}());
