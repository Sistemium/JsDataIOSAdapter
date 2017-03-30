(function (module) {

  function ShipmentListController(Schema, $q, Helpers, $scope, SalesmanAuth, $state) {

    const {SaleOrder, Shipment, ShipmentPosition, Outlet, Driver} = Schema.models();
    const {saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope);

    let initDate = SaleOrder.meta.nextShipmentDate();

    vm.use({

      date: $state.params.date,
      initDate,

      onStateChange,
      itemClick

    });

    if (!vm.date) return setDate(initDate);

    SalesmanAuth.watchCurrent($scope, getData);

    vm.watchScope('vm.date', _.debounce(setDate, 300));
    $scope.$on('rootClick', () => $state.go('sales.shipmentList'));

    /*
     Functions
     */

    function itemClick(item) {
      $state.go('.item', {id: item.id});
    }

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
        Driver.findAll(),
        Outlet.findAll(filter),
        Shipment.findAllWithRelations(filter, {bypassCache: true})(['Driver','Outlet']),
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
