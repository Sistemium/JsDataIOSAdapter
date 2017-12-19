'use strict';

(function () {

  function SaleOrderInfiniteScrollController(Schema, $scope, SalesmanAuth, $state, $q, Helpers, SaleOrderHelper, saMedia, localStorageService) {

    const {ScrollHelper, saControllerHelper} = Helpers;
    let {SaleOrder} = Schema.models();

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

      isReady: false,
      itemClick,
      newItemClick,
      getData,
      rowHeight,
      onWorkflowChange

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

    $scope.$watch('vm.currentWorkflow', onWorkflowChange);

    SalesmanAuth.watchCurrent($scope, onSalesmanChange);

    /*
     Handlers
     */

    /*
     Functions
     */

    function onWorkflowChange() {

      resetVariables();
      getData();

    }

    function getWorkflows(salesmanId) {

      vm.currentWorkflows = {};

      let filter;

      if (salesmanId) {
        filter = {salesmanId: salesmanId}
      }

      vm.workflowPromise = SaleOrder.groupBy(filter, ['processing']);

    }

    function rowHeight() {
      return isWideScreen() ? 62 : 82;
    }

    function isWideScreen() {
      return !saMedia.xsWidth && !saMedia.xxsWidth;
    }

    function resetVariables() {

      vm.data = [];
      gotAllData = false;
      startPage = 1;
      localStorageService.remove(vm.rootState + '.scroll');

    }

    function onSalesmanChange(salesman) {

      vm.currentSalesman = _.get(salesman, 'id') || _.get(SalesmanAuth.getCurrentUser(), 'id') || null;

      getWorkflows(vm.currentSalesman);

      resetVariables();

      getData();

    }

    function cleanup() {
      SaleOrder.ejectAll();
      // SaleOrderPosition.ejectAll();
      // Outlet.ejectAll();
    }

    function getData() {

      if (!vm.currentWorkflow) {
        vm.currentWorkflow = localStorageService.get('currentWorkflow');
      }

      if (busyGettingData || gotAllData) {
        return;
      }

      vm.isReady = false;

      let filter = SalesmanAuth.makeFilter({'x-order-by:': '-date'});

      if (vm.currentWorkflow) {

        filter.where = {
          processing: {
            '==': vm.currentWorkflow
          }
        };

      }

      let options = {
        pageSize: pageSize,
        startPage: startPage,
        bypassCache: true
      };

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

          let promises = _.map(res, saleOrder => saleOrder.DSLoadRelations(['Outlet']));

          return $q.all(promises)
            .then(() => {
              vm.data = _.orderBy(saleOrdersWithDates, ['date'], ['desc']);
              startPage++;
            });

        });

      vm.setBusy(busyGettingData)
        .then(() => {
          vm.isReady = true;
          busyGettingData = false;
        });

    }

    function itemClick(item) {
      $state.go('.item', {id: item.id});
    }

    function newItemClick() {
      $state.go('sales.catalogue.saleOrder');
    }

  }

  angular.module('webPage')
    .controller('SaleOrderInfiniteScrollController', SaleOrderInfiniteScrollController);

})();
