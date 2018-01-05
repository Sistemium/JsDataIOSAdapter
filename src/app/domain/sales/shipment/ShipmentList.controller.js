(function (module) {

  function ShipmentListController(Schema, Helpers, $scope, SalesmanAuth, $state, saMedia) {

    const {Shipment, ShipmentPosition, Outlet, Driver, ShipmentEgais} = Schema.models();
    const {saControllerHelper, ScrollHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope);

    const rootState = 'sales.shipmentList';

    const pageSize = 50;
    let startPage = 1;
    let gotAllData = false;

    vm.use({

      driverPopoverOpen: {},
      data: [],
      rootState,

      itemClick,
      getData,
      isWideScreen,
      rowHeight

    })
      .use(ScrollHelper);

    SalesmanAuth.watchCurrent($scope, onSalesmanChange);

    $scope.$on('rootClick', () => {
      if ($state.current.name === rootState) {
        vm.scrollTop();
      }
      $state.go(rootState);
    });

    $scope.$on('$destroy', cleanup);

    vm.watchScope(isWideScreen, () => {
      let filteredData = _.filter(vm.data, item => !item.isFooter);
      vm.data = calcTotals(filteredData);
      $scope.$broadcast('vsRepeatTrigger');
    });

    /*
     Functions
     */

    function rowHeight() {
      return isWideScreen() ? 40 : 79;
    }

    function onSalesmanChange(salesman) {

      vm.currentSalesman = salesman;
      vm.ready = false;

      startPage = 0;
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

      if (!isWideScreen()) {
        return data;
      }

      _.each(grouped, (dateItems, date) => {

        //console.log(dateItems, date);

        let footer = {
          date,
          id: `${date}-footer`,
          isFooter: true,
          totalCost: () => _.sumBy(dateItems, shipment => {

            return shipment.totalCost && !shipment.isFooter && shipment.totalCost() || 0;

          })
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

      // let positionsFilter = _.clone(filter);
      //
      // if (IOS.isIos()) {
      //   positionsFilter = {where: {}};
      //
      //   if (filter.salesmanId) {
      //     positionsFilter.where['shipment.salesmanId'] = {'==': filter.salesmanId};
      //   }
      // }

      busyGettingData = Shipment.findAllWithRelations(filter, options)(['Outlet', 'Driver'])
        .then(res => {

          if (!res.length) {
            gotAllData = true;
          }

          let dates = _.groupBy(res, 'date');

          dates = _.map(dates, (val, date) => {

            return {
              date,
              id: date,
              totalCost: () => _.sumBy(val, shipment => {
                return shipment.totalCost && !shipment.isFooter && shipment.totalCost() || 0;
              })
            };

          });

          dates.push(...res);

          let filteredData = _.filter(vm.data, item => !item.isFooter);

          dates.push(...filteredData);

          let data = _.orderBy(_.uniqBy(dates, 'id'), ['date', 'isFooter', 'ndoc'], ['desc', 'desc', 'desc']);
          vm.data = calcTotals(data);
          startPage++;

        });

      vm.setBusy(busyGettingData)
        .finally(() => {
          busyGettingData = false;
        });

    }

  }

  module.controller('ShipmentListController', ShipmentListController);

})(angular.module('Sales'));
