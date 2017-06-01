(function (module) {

  function ShipmentListController(Schema, $q, Helpers, $scope, SalesmanAuth, $state, IOS) {

    const {SaleOrder, Shipment, ShipmentPosition, Outlet, Driver, ShipmentEgais} = Schema.models();
    const {saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope);

    let initDate = SaleOrder.meta.nextShipmentDate();

    vm.use({

      date: $state.params.date,
      initDate,
      driverPopoverOpen: {},

      onStateChange,
      itemClick,
      totalCost,
      totalPositions

    });

    if (!vm.date) return setDate(initDate);

    SalesmanAuth.watchCurrent($scope, getData);

    vm.watchScope('vm.date', _.debounce(setDate, 300));
    $scope.$on('rootClick', () => $state.go('sales.shipmentList'));

    /*
     Functions
     */

    function totalCost() {
      return _.sumBy(vm.data, shipment => shipment.totalCost());
    }

    function totalPositions() {
      return _.sumBy(vm.data, 'positions.length');
    }


    function itemClick(item, $event) {
      let driverPopoverOpen = _.find(vm.driverPopoverOpen, val => val);
      if ($event.defaultPrevented || driverPopoverOpen) return;
      $state.go('.item', {id: item.id});
    }

    function onStateChange(to) {
      if (!/sales.shipmentList/.test(to.name)) cleanup();
    }

    function cleanup() {
      ShipmentPosition.ejectAll();
      Shipment.ejectAll();
      ShipmentEgais.ejectAll();
    }

    function getData(salesman) {

      let date = vm.date;

      let filter = SalesmanAuth.makeFilter({date});

      let positionsFilter = _.clone(filter);

      if (IOS.isIos()) {
        positionsFilter = {where: {'shipment.date': {'==': date}}};

        if (filter.salesmanId) {
          positionsFilter.where['shipment.salesmanId'] = {'==': filter.salesmanId};
        }
      }

      vm.currentSalesman = salesman;

      let outletFilter = _.omit(Outlet.meta.salesmanFilter(filter), 'date');
      let shipmentRelations = ['Driver', 'Outlet'];

      let busy = $q.all([
        Driver.findAll(),
        Outlet.findAll(outletFilter),
        Shipment.findAllWithRelations(filter, {bypassCache: true})(shipmentRelations),
        ShipmentPosition.findAll(positionsFilter, {bypassCache: true, limit: 5000}),
        ShipmentEgais.findAll(positionsFilter, {bypassCache: true, limit: 5000})
      ])
        .then(() => {
          _.assign(filter, {orderBy:['outlet.name', 'outlet.address']});
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
