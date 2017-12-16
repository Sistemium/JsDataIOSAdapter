'use strict';

(function () {

  function SaleOrderDetailsController(Schema, $scope, $state, $q, SaleOrderHelper, $timeout, Helpers) {

    const {saControllerHelper, ClickHelper, toastr} = Helpers;

    const vm = saControllerHelper
      .setup(this, $scope)
      .use(SaleOrderHelper)
      .use(ClickHelper);

    const {SaleOrderPosition, SaleOrder, Contract, PriceType} = Schema.models();

    vm.use({

      toggleEditClick: () => $state.go('sales.catalogue.saleOrder', {saleOrderId: vm.saleOrder.id}),

      setSaleOrderClick,
      copySaleOrderClick

    });

    /*
     Init
     */

    vm.setBusy(getData());

    /*
     Listeners
     */

    vm.watchScope('vm.saleOrder.date', newValue => {
      if (!newValue) return;
      vm.rebindAll(SaleOrder, {date: newValue}, 'draftSaleOrders');
    });

    SaleOrder.bindOne($state.params.id, $scope, 'vm.saleOrder', _.debounce(safeSave, 700));

    /*
     Functions
     */

    function copySaleOrderClick() {

      vm.confirmCopySaleOrder = !vm.confirmCopySaleOrder;

      if (vm.confirmCopySaleOrder) {
        return $timeout(2000)
          .then(() => vm.confirmCopySaleOrder = false);
      }

      let so = SaleOrder.copyInstance(vm.saleOrder);

      so.processing = 'draft';

      let defaultDate = SaleOrder.meta.nextShipmentDate();
      let msg = '';

      if (defaultDate > so.date) {
        so.date = defaultDate;
        msg = `Дата доставки изменена на ${defaultDate}`;
      }

      let copying = SaleOrder.create(so)
        .then(saleOrder => {
          return $q.all(_.map(vm.saleOrder.positions, position => {
            let newPosition = SaleOrderPosition.copyInstance(position);
            newPosition.saleOrderId = saleOrder.id;
            return SaleOrderPosition.create(newPosition);
          }))
            .then(() => {
              $state.go('.', {id: saleOrder.id});
              toastr.info(msg, 'Заказ скопирован');
            });
        })
        .catch(err => {
          toastr.error(angular.toJson(err))
        });

      vm.setBusy(copying);

    }

    function setSaleOrderClick(saleOrder) {
      if (!saleOrder) {
        return $state.go('sales.catalogue.saleOrder', {saleOrderId: null});
      }
      $state.go($state.current.name, {id: saleOrder.id}, {inherit: true});
    }


    function safeSave() {
      return vm.saleOrder && vm.saleOrder.safeSave();
    }

    function getData() {

      return SaleOrder.find($state.params.id)
        .then(saleOrder => SaleOrder.loadRelations(saleOrder))
        .then(saleOrder => {

          Contract.find(saleOrder.contractId);
          PriceType.find(saleOrder.priceTypeId);

          return $q.all(_.map(saleOrder.positions, position => {
            return SaleOrderPosition.loadRelations(position)
          }));

        })
        .catch(e => console.error(e));

    }

  }

  angular.module('webPage')
    .controller('SaleOrderDetailsController', SaleOrderDetailsController);

})();