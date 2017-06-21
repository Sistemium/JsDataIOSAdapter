(function (module) {

  function ShipmentListController(Schema, $q, Helpers, $scope, SalesmanAuth, $state, saMedia, IOS, localStorageService) {

    const {Shipment, ShipmentPosition, Outlet, Driver, ShipmentEgais} = Schema.models();
    const {saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope);

    const pageSize = 50;
    let startPage = 1;
    let gotAllData = false;
    let currSalesman;

    vm.data = [];

    vm.use({

      driverPopoverOpen: {},

      onStateChange,
      itemClick,
      getData,
      isWideScreen

    });

    SalesmanAuth.watchCurrent($scope, onSalesmanChange);

    $scope.$on('rootClick', () => $state.go('sales.shipmentList'));

    /*
     Functions
     */


    function onSalesmanChange() {

      vm.ready = false;

      currSalesman = null;
      startPage = 1;
      gotAllData = false;

      let filter = SalesmanAuth.makeFilter();

      if (vm.data.length) {
        vm.data = [];
        cleanup();
      }

      vm.setBusy([
        Driver.findAll(filter),
        Outlet.findAll(filter)
      ]).then(() => {
        return getData(filter);
      });

    }

    function isWideScreen() {
      return !saMedia.xsWidth && !saMedia.xxsWidth;
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

    let busyGettingData;

    function getData(salesmanFilter) {

      vm.ready = true;

      if (busyGettingData || gotAllData) {
        return;
      }

      if (salesmanFilter) {
        currSalesman = salesmanFilter;
      } else {
        let lsSalesman = localStorageService.get('currentSalesmanId');
        if (lsSalesman) {
          currSalesman = {'salesmanId': lsSalesman}
        }
      }

      let filter = {'x-order-by:': '-date'};

      if (!_.get(filter, 'salesmanId')) {
        _.assign(filter, currSalesman);
      }

      let options = {
        pageSize: pageSize,
        startPage: startPage + 1,
        bypassCache: true
      };

      let positionsFilter = _.clone(filter);

      if (IOS.isIos()) {
        positionsFilter = {where: {}};

        if (filter.salesmanId) {
          positionsFilter.where['shipment.salesmanId'] = {'==': filter.salesmanId};
        }
      }

      busyGettingData = Shipment.findAll(filter, options).then((res) => {

        if (!res.length) {
          gotAllData = true;
        }

        vm.data.push(...res);

        vm.data = _.orderBy(_.uniq(vm.data, 'id'), ['date', 'ndoc'], ['desc', 'asc']);

        _.each(res, shipment => shipment.DSLoadRelations(['Outlet', 'Driver']));

        let posQ = _.map(vm.data, (item) => {

          if (startPage === 1) {
            ShipmentEgais.findAll(positionsFilter, {bypassCache: true, limit: 5000});
          }

          return ShipmentPosition.findAll({shipmentId: item.id});

        });

        return $q.all([
          ...posQ,

          $q.when().then(() => {
            startPage++
          })

        ]);

      });

      vm.setBusy(busyGettingData)
        .finally(() => busyGettingData = false);

    }

  }

  module.controller('ShipmentListController', ShipmentListController);

})(angular.module('Sales'));
