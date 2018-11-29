(function (module) {

  module.component('shipmentList', {

    bindings: {
      filter: '<'
    },

    templateUrl: 'app/domain/sales/shipment/shipmentList/shipmentList.html',
    controller: ShipmentListController,
    controllerAs: 'vm'

  });

  function ShipmentListController(Schema, Helpers, $scope, SalesmanAuth, $state,
                                  saMedia, ShipmentModal) {

    const { Shipment, ShipmentPosition, Outlet, Driver, ShipmentEgais } = Schema.models();
    const { saControllerHelper, ScrollHelper } = Helpers;

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
      return isWideScreen() ? 46 : 79;
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
          cls: 'footer',
          totalCost: () => _.sumBy(dateItems, shipment => {

            return !shipment.cls && shipment.totalCost && shipment.totalCost() || 0;

          })
        };

        let lastShipmentIdx = _.findLastIndex(data, { date });
        data.splice(lastShipmentIdx + 1, 0, footer);

      });

      return data;

    }

    function itemClick(item, $event) {

      let driverPopoverOpen = _.find(vm.driverPopoverOpen, val => val);
      if ($event.defaultPrevented || driverPopoverOpen) return;

      if ($state.is('sales.shipmentList')) {
        $state.go('.item', { id: item.id })
      } else {
        ShipmentModal.show(item.id);
      }

    }

    function cleanup() {
      ShipmentPosition.ejectAll();
      Shipment.ejectAll();
      ShipmentEgais.ejectAll();
    }

    function loadShipmentRelations(shipments) {

      const ids = _.filter(_.map(shipments, shipment => {
        return shipment.outlet ? null : shipment.outletId;
      }));

      if (!ids.length) {
        return shipments;
      }

      const where = { id: { '==': ids } };

      return Outlet.findAll({ where })
        .then(() => _.filter(shipments, 'outlet'));

    }

    let busyGettingData;

    function getData() {

      vm.ready = true;

      if (busyGettingData || gotAllData) {
        return;
      }

      let filter = SalesmanAuth.makeFilter({ 'x-order-by:': '-date,-ndoc' });

      let options = {
        pageSize: pageSize,
        startPage: startPage + 1,
        bypassCache: true
      };

      _.assign(filter, vm.filter);

      busyGettingData = Shipment.findAllWithRelations(filter, options)(['Driver'])
        .then(loadShipmentRelations)
        .then(res => {

          if (!res.length) {
            gotAllData = true;
          }

          let dates = _.groupBy(res, 'date');

          dates = _.map(dates, (val, date) => {

            return {
              date,
              id: date,
              cls: 'date',
              totalCost: () => _.sumBy(val, shipment => {
                return shipment.totalCost && !shipment.isFooter && shipment.totalCost() || 0;
              })
            };

          });

          dates.push(...res);

          let filteredData = _.filter(vm.data, item => !item.isFooter);

          dates.push(...filteredData);

          let data = _.orderBy(
            _.uniqBy(dates, 'id'),
            ['date', 'isFooter', 'ndoc'],
            ['desc', 'desc', 'desc']
          );

          vm.data = calcTotals(data);
          startPage++;

        });

      vm.setBusy(busyGettingData)
        .finally(() => {
          busyGettingData = false;
        });

    }

  }

})(angular.module('Sales'));
