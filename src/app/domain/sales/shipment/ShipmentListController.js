(function (module) {

  function ShipmentListController(Schema, $q, Helpers, $scope, SalesmanAuth, $state) {

    const {SaleOrder, Shipment, ShipmentPosition, Outlet} = Schema.models();
    const {saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope);

    let initDate = SaleOrder.meta.nextShipmentDate();

    vm.use({

      date: $state.params.date,
      initDate,

      onStateChange

    });

    if (!vm.date) return setDate(initDate);

    SalesmanAuth.watchCurrent($scope, getData);

    vm.watchScope('vm.date', _.debounce(setDate, 300));

    /*
     Functions
     */

    function onStateChange(to) {
      if (!/sales.shipmentList/.test(to.name)) cleanup();
    }

    function cleanup() {
      ShipmentPosition.ejectAll();
      Shipment.ejectAll();
    }

    function getData(salesman) {

      let date = vm.date;

      let filter = SalesmanAuth.makeFilter({date});

      vm.currentSalesman = salesman;

      let busy = $q.all([
        Outlet.findAll(filter),
        Shipment.findAll(filter, {bypassCache: true}),
        ShipmentPosition.findAll(filter, {bypassCache: true})
      ])
        .then(() => {
          vm.rebindAll(Shipment, filter, 'vm.data');
        });

      vm.setBusy(busy);

    }

    function setDate(date) {
      $state.go('.', {date: date || initDate});
    }

  }

  module.controller('ShipmentListController', ShipmentListController);

})(angular.module('Sales'));
