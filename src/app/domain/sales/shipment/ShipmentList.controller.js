(function (module) {

  function ShipmentListController(Schema, $q, Helpers, $scope, SalesmanAuth, $state, IOS) {

    const {SaleOrder, Shipment, ShipmentPosition, Outlet, Driver} = Schema.models();
    const {saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope);

    let initDate = SaleOrder.meta.nextShipmentDate();

    vm.use({

      date: $state.params.date,
      initDate,

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

      let positionsFilter = _.clone(filter);

      if (IOS.isIos()) {
        positionsFilter = {where: {'shipment.date': {'==': date}}};

        if (filter.salesmanId) {
          positionsFilter.where['shipment.salesmanId']= {'==': filter.salesmanId};
        }
      }

      vm.currentSalesman = salesman;

      let outletFilter = _.omit(Outlet.meta.salesmanFilter(filter), 'date');

      let busy = $q.all([
        Driver.findAll(),
        Outlet.findAll(outletFilter),
        Shipment.findAllWithRelations(filter, {bypassCache: true})(['Driver','Outlet']),
        ShipmentPosition.findAll(positionsFilter, {bypassCache: true, limit: 5000})
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
