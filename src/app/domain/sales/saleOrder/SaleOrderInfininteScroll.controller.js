'use strict';

(function () {

  function SaleOrderInfiniteScrollController(Schema, $scope, SalesmanAuth, $state, $q, Helpers, SaleOrderHelper, saMedia, localStorageService) {

    const {ScrollHelper, saControllerHelper} = Helpers;
    let {SaleOrder, SaleOrderPosition, Outlet, Workflow} = Schema.models();

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
      getData,
      rowHeight,
      $onInit,
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

    SalesmanAuth.watchCurrent($scope, onSalesmanChange);

    $scope.$watch('vm.currentWorkflow', onWorkflowChange);

    /*
     Handlers
     */

    /*
     Functions
     */

    function $onInit() {

      vm.workflowDictionary = {};

      Workflow.findAll({code: 'SaleOrder.v2'})
        .then((res) => {
          let workflowTranslations = _.get(res[0], 'workflow');
          _.each(workflowTranslations, (workflow, key) => {
            _.assign(vm.workflowDictionary, ({
              [key]: {
                translation: _.get(workflow, 'label'),
                cls: _.get(workflow, 'cls')
              }
            }));
          });
        })
    }

    function onWorkflowChange() {

      resetVariables();
      getData();

    }

    function getWorkflows(salesmanId) {

      let filter;

      if (salesmanId) {
        filter = {salesmanId: salesmanId}
      }

      SaleOrder.groupBy(filter, ['processing'])
        .then(res => {
          vm.currentWorkflows = _.map(res, item => _.pick(item, ['processing', 'count()']));
        });

    }

    function rowHeight() {
      return isWideScreen() ? 62 : 86;
    }

    function isWideScreen() {
      return !saMedia.xsWidth && !saMedia.xxsWidth;
    }

    function resetVariables(resetWorkflow) {

      vm.data = [];
      gotAllData = false;
      startPage = 1;
      localStorageService.remove(vm.rootState + '.scroll');

      if (resetWorkflow) {
        vm.currentWorkflow = null;
      }

    }

    function onSalesmanChange(salesman) {

      vm.currentSalesman = _.get(salesman, 'id') || _.get(SalesmanAuth.getCurrentUser(), 'id') || null;

      getWorkflows(vm.currentSalesman);

      resetVariables(true);

      getData();

    }

    function cleanup() {
      SaleOrder.ejectAll();
      SaleOrderPosition.ejectAll();
      Outlet.ejectAll();
    }

    function getData() {

      if (busyGettingData || gotAllData) {
        return;
      }

      let filter = SalesmanAuth.makeFilter({'x-order-by:': '-date'});

      if (vm.currentWorkflow) {

        filter.where = {};

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
