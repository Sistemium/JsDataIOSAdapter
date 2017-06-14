(function (module) {

  function ShipmentListController(Schema, $q, Helpers, $scope, SalesmanAuth, $state, saMedia) {

    const {Shipment, ShipmentPosition, Outlet, Driver} = Schema.models();
    const {saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope);

    const pageSize = 100;
    let startPage = 1;
    let filter = SalesmanAuth.makeFilter();

    vm.use({

      driverPopoverOpen: {},

      onStateChange,
      itemClick,
      onScrollEnd,
      onElemLoad,
      isWideScreen,
      totalCost
    });

    SalesmanAuth.watchCurrent($scope, getData);

    $scope.$on('rootClick', () => $state.go('sales.shipmentList'));

    /*
     Functions
     */

    function isWideScreen() {
      return !saMedia.xsWidth && !saMedia.xxsWidth;
    }

    function getDataOnScrollEnd() {

      vm.setBusy(
        Shipment.findAll({'x-order-by:': '-date'}, {
          pageSize: pageSize,
          startPage: startPage + 1,
          bypassCache: true
        }).then((res) => {
          return res
        })
      ).then(res => {

        vm.data.push(...res);

        let busy = $q.all([

          startPage++,

          vm.data = _.uniq(vm.data, 'id'),

          _.each(res, (item) => {
            ShipmentPosition.findAll({shipmentId: item.id})
          })

        ]);

        vm.setBusy(busy);

      }).catch(
        e => console.error(e)
      );

    }

    function totalCost() {
      return _.sumBy(vm.data, shipment => shipment.totalCost());
    }

    function onElemLoad() {
      debounceTest();
    }

    function onScrollEnd() {
      getDataOnScrollEnd();
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
    }

    function getData(salesman) {

      Shipment.findAll({'x-order-by:': '-date'}, {
        pageSize: pageSize,
        startPage: startPage,
        bypassCache: true
      }).then((res) => {
        vm.data = res;

        let busy = $q.all([
          Driver.findAll(),
          Outlet.findAll(),
          Shipment.findAllWithRelations(filter, {bypassCache: true})(['Driver', 'Outlet']),
          _.each(vm.data, (item) => {
            ShipmentPosition.findAll({shipmentId: item.id})
          })
        ]);

        vm.setBusy(busy);

      });

      vm.currentSalesman = salesman;

    }

  }

  module.controller('ShipmentListController', ShipmentListController);

})(angular.module('Sales'));
