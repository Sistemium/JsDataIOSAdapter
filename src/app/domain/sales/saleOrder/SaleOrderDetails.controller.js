'use strict';

(function () {

  function SaleOrderDetailsController(Schema, $scope, $state, $q, SaleOrderHelper,
                                      $timeout, Helpers, saAsync) {

    const { saControllerHelper, ClickHelper, toastr, saEtc } = Helpers;

    const vm = saControllerHelper
      .setup(this, $scope)
      .use(SaleOrderHelper)
      .use(ClickHelper);

    const { SaleOrderPosition, SaleOrder, Contract, PriceType } = Schema.models();

    vm.use({

      toggleEditClick: () => $state.go('sales.catalogue.saleOrder', { saleOrderId: vm.saleOrder.id }),

      setSaleOrderClick,
      copySaleOrderClick

    });

    /*
     Init
     */

    vm.setBusy(getData());

    $scope.$on('$destroy', $onDestroy);

    /*
     Listeners
     */

    vm.watchScope('vm.saleOrder.date', newValue => {
      if (!newValue) return;
      vm.rebindAll(SaleOrder, { date: newValue }, 'draftSaleOrders');
    });

    SaleOrder.bindOne($state.params.id, $scope, 'vm.saleOrder', saEtc.debounce(safeSave, 700, $scope));

    /*
     Functions
     */

    function $onDestroy() {
      return safeSave();
    }

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
        .then(saleOrder =>
          saAsync.chunkSerial(1, vm.saleOrder.positions, position => {
            let newPosition = SaleOrderPosition.copyInstance(position);
            newPosition.saleOrderId = saleOrder.id;
            return SaleOrderPosition.create(newPosition);
          })
            .then(() => {
              $state.go('.', { id: saleOrder.id });
              toastr.info(msg, 'Заказ скопирован');
            })
        )
        .catch(err => {
          toastr.error(angular.toJson(err))
        });

      vm.setBusy(copying);

    }

    function setSaleOrderClick(saleOrder) {
      if (!saleOrder) {
        return $state.go('sales.catalogue.saleOrder', { saleOrderId: null });
      }
      $state.go($state.current.name, { id: saleOrder.id }, { inherit: true });
    }


    function safeSave() {
      if (vm.saleOrder && !vm.saleOrder.safeSave) {
        // console.warn(vm.saleOrder);
        return;
      }
      return vm.saleOrder && vm.saleOrder.safeSave();
    }

    function getData() {

      return SaleOrder.find($state.params.id)
        .then(saleOrder => saleOrder.DSLoadRelations('SaleOrderPosition', { bypassCache: true }))
        .then(saleOrder => SaleOrder.loadRelations(saleOrder, ['Outlet', 'Contract', 'Salesman']))
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
