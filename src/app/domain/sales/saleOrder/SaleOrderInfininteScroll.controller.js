'use strict';

(function () {

  function SaleOrderInfiniteScrollController(Schema, $scope, SalesmanAuth, $state, $q, Helpers, SaleOrderHelper, saMedia, localStorageService, Sockets) {

    const {ScrollHelper, saControllerHelper} = Helpers;
    let {SaleOrder} = Schema.models();

    let vm = saControllerHelper
      .setup(this, $scope)
      .use(SaleOrderHelper);

    const pageSize = 50;
    let startPage = 1;

    let gotAllData = false;
    let busyGettingData;
    let saleOrders = [];

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

    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJsData));

    $scope.$on('rootClick', () => {

      if ($state.current.name === vm.rootState) {
        vm.scrollTop();
      }

      $state.go(vm.rootState);

    });

    $scope.$on('$destroy', cleanup);

    $scope.$watch('vm.currentWorkflow', onWorkflowChange);

    SalesmanAuth.watchCurrent($scope, onSalesmanChange);

    const JSD_DESTROY = 'DS.afterEject'; //'DS.afterDestroy';

    SaleOrder.on(JSD_DESTROY, onDestroySaleOrder);

    /*
     Handlers
     */

    function onDestroySaleOrder(model, saleOrder) {

      console.warn('onDestroySaleOrder', saleOrder);

      let {date, id} = saleOrder;

      let groupedByDate = _.get(_.groupBy(vm.data, {date: date}), true);

      if (_.size(groupedByDate) <= 2) {
        _.remove(vm.data, {id: date});
      }

      _.remove(vm.data, {id: id});

    }

    function onJsData(event) {

      let {data, resource} = event;

      if (resource !== 'SaleOrder') {
        return;
      }

      console.warn(resource, data);

      mergeViewData(data);

    }

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
      return isWideScreen() ? 61 : 91;
    }

    function isWideScreen() {
      return !saMedia.xsWidth && !saMedia.xxsWidth;
    }

    function resetVariables() {

      vm.data = [];

      saleOrders = [];
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

      SaleOrder.off(JSD_DESTROY, onDestroySaleOrder);

      let where = {
        processing: {
          '!=': 'draft'
        }
      };

      SaleOrder.ejectAll({where});

    }

    function mergeViewData(withData) {

      saleOrders.push(...withData);

      let saleOrdersWithDates = [];
      let dates = _.groupBy(saleOrders, 'date');

      dates = _.map(dates, (val, date) => {
        return {date, id: date};
      });

      saleOrdersWithDates.push(...dates);
      saleOrdersWithDates.push(...saleOrders);

      saleOrdersWithDates = _.uniqBy(saleOrdersWithDates, 'id');

      vm.data = _.orderBy(saleOrdersWithDates, ['date'], ['desc']);

    }

    function getData() {

      console.log('fired');

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
        pageSize,
        startPage,
        bypassCache: true
      };

      busyGettingData = SaleOrder.findAll(filter, options)
        .then(res => {

          if (res.length < pageSize) {
            gotAllData = true;
          }


          let promises = _.map(res, saleOrder => saleOrder.DSLoadRelations(['Outlet']));

          return $q.all(promises)
            .then(() => {
              startPage++;
              mergeViewData(res);
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
