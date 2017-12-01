'use strict';

(function () {

  function SaleOrderInfiniteScrollController(Schema, $scope, SalesmanAuth, $state, IOS, $q, Helpers, SaleOrderHelper, saMedia) {

    const {ScrollHelper, saControllerHelper} = Helpers;
    let {SaleOrder, SaleOrderPosition, Outlet} = Schema.models();

    let vm = saControllerHelper
      .setup(this, $scope)
      .use(SaleOrderHelper);

    const pageSize = 50;
    let startPage = 1;
    let gotAllData = false;
    let busyGettingData;

    vm.use({

      data: [],
      rootState: 'sales.saleOrders',

      itemClick,
      newItemClick,
      getDayClass,
      getData,
      rowHeight

    })
      .use(ScrollHelper);

    /*
     Listeners
     */

    $scope.$on('rootClick', () => {

      if ($state.current.name === vm.rootState) {
        vm.scrollTop();
      }

      $state.go(vm.rootState);

    });

    $scope.$on('$destroy', cleanup);

    SalesmanAuth
      .watchCurrent($scope, onSalesmanChange);

    /*
     Handlers
     */

    /*
     Functions
     */

    function rowHeight() {
      return isWideScreen() ? 62 : 162;
    }

    function isWideScreen() {
      return !saMedia.xsWidth && !saMedia.xxsWidth;
    }

    function onSalesmanChange(salesman) {

      vm.currentSalesman = _.get(salesman, 'id') || _.get(SalesmanAuth.getCurrentUser(), 'id') || null;
      vm.data = [];
      gotAllData = false;
      startPage = 1;
      getData();

    }

    function cleanup() {
      SaleOrderPosition.ejectAll();
      Outlet.ejectAll();
    }

    function getData() {

      if (busyGettingData || gotAllData) {
        console.warn('Busy working on previous request');
        return;
      }

      let filter = SalesmanAuth.makeFilter({'x-order-by:': '-date'});

      let options = {
        pageSize: pageSize,
        startPage: startPage,
        bypassCache: true
      };

      //TODO: WTF??
      //if (IOS.isIos()) {
      //  let positionsFilter = _.clone(filter);
      //  positionsFilter = {where: {}};
      //
      //  if (filter.salesmanId) {
      //    positionsFilter.where['shipment.salesmanId'] = {'==': filter.salesmanId};
      //  }
      //}

      busyGettingData = SaleOrder.findAll(filter, options)
        .then(res => {

          if (res.length < pageSize) {
            gotAllData = true;
          }

          let saleOrdersWithDates = [];

          let dates = _.groupBy(res, 'date');

          dates = _.map(dates, (val, date) => {
            return {date, id: date};
          });

          saleOrdersWithDates.push(...dates);
          saleOrdersWithDates.push(...res);

          if (vm.data.length) {
            saleOrdersWithDates.push(...vm.data);
          }

          saleOrdersWithDates = _.uniqBy(saleOrdersWithDates, 'id');

          let promises = _.map(res, saleOrder => saleOrder.DSLoadRelations(['SaleOrderPosition', 'Outlet']));

          return $q.all(promises)
            .then(() => {
              vm.data = _.orderBy(saleOrdersWithDates, ['date'], ['desc']);
              startPage++;
            });

        });

      vm.setBusy(busyGettingData)
        .then(() => {
          busyGettingData = false;
        });

    }

    function itemClick(item) {
      console.log(vm);
      $state.go('.item', {id: item.id});
    }

    function newItemClick() {
      $state.go('sales.catalogue.saleOrder');
    }

    function getDayClass(data) {

      let {date, mode} = data;

      if (mode === 'day') {

        let events = _.keyBy(eventsGroupedByDate[moment(date).format()], 'processing');
        if (!events) return;

        let draft = events['draft'];
        if (draft && draft['count()']) {
          return 'haveDraft';
        }

        if (moment(date).isSame(moment(), 'day')) {
          return 'today';
        }

        let counts = _.sumBy(_.values(events), 'count()');
        if (counts) return 'haveSaleOrder';

      }

    }

  }

  angular.module('webPage')
    .controller('SaleOrderInfiniteScrollController', SaleOrderInfiniteScrollController);

})();
