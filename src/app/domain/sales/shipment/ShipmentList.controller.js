(function (module) {

  function ShipmentListController(Schema, $q, Helpers, $scope, SalesmanAuth, $state, saMedia, IOS) {

    const {Shipment, ShipmentPosition, Outlet, Driver, ShipmentEgais} = Schema.models();
    const {saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope);

    const pageSize = 50;
    let startPage = 1;
    let gotAllData = false;

    vm.use({

      driverPopoverOpen: {},
      data: [],

      onStateChange,
      itemClick,
      getData,
      isWideScreen,
      rowHeight

    });

    SalesmanAuth.watchCurrent($scope, onSalesmanChange);

    $scope.$on('rootClick', () => $state.go('sales.shipmentList'));

    /*
     Functions
     */

    function rowHeight() {
      return isWideScreen() ? 40 : (vm.currentSalesman ? 114 : 131);
    }

    function onSalesmanChange(salesman) {

      vm.currentSalesman = salesman;
      vm.ready = false;

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

    function calcTotals(data) {

      let grouped = _.groupBy(data, 'date');

      _.each(grouped, (dateItems, date) => {

        let totalCost = 0;

        _.each(dateItems, (shipment) => {

          if (shipment.totalCost && !shipment.isFooter) {
            totalCost += shipment.totalCost();
          }

        });

        let footer = {
          date,
          id: `${date}-footer`,
          isFooter: true,
          totalCost
        };

        let lastShipmentIdx = _.findLastIndex(data, {date});
        data.splice(lastShipmentIdx + 1, 0, footer);

      });

      return data;

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

    function getData() {

      vm.ready = true;

      if (busyGettingData || gotAllData) {
        return;
      }

      let filter = SalesmanAuth.makeFilter({'x-order-by:': '-date,-ndoc'});

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

      busyGettingData = Shipment.findAll(filter, options).then(res => {

        if (!res.length) {
          gotAllData = true;
        }

        let dates = _.groupBy(res, 'date');

        dates = _.map(dates, (val, date) => {
          return {date, id: date};
        });

        dates.push(...res);

        let filteredData = _.filter(vm.data, item => !item.isFooter);

        dates.push(...filteredData);

        _.each(res, shipment => shipment.DSLoadRelations(['Outlet', 'Driver', 'ShipmentEgais']));

        let posQ = _.map(res, shipment => shipment.DSLoadRelations(['ShipmentPosition']));

        return $q.all(posQ)
          .then(() => {
            let data = _.orderBy(_.uniqBy(dates, 'id'), ['date', 'isFooter', 'ndoc'], ['desc', 'desc', 'desc']);
            vm.data = calcTotals(data);
            startPage++;
          });

      });

      vm.setBusy(busyGettingData)
        .finally(() => {
          busyGettingData = false;
        });

    }

  }

  module.controller('ShipmentListController', ShipmentListController);

})(angular.module('Sales'));
