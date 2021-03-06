'use strict';

(function (module) {

  module.component('saleOrderView', {

    bindings: {
      customFilter: '<',
      disableElements: '<'
    },

    templateUrl: 'app/domain/sales/saleOrder/saleOrderView/saleOrderView.html',

    controller: SaleOrderInfiniteScrollController,
    controllerAs: 'vm'

  });

  const LIST_ITEM_HEIGHT_XS = 90;
  const LIST_ITEM_HEIGHT = 66;

  function SaleOrderInfiniteScrollController(Schema, $scope, SalesmanAuth, $state, $q, Helpers,
                                             SaleOrderHelper, saMedia, localStorageService, Sockets) {

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
      render: false,

      saleOrderItemClick,
      newItemClick,
      getData,
      rowHeight

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

      // console.warn('onDestroySaleOrder', saleOrder);

      let {date, id} = saleOrder;

      if (!_.find(vm.data, {id})) {
        return;
      }

      let groupedByDate = _.get(_.groupBy(vm.data, {date: date}), true);

      if (_.size(groupedByDate) <= 2) {
        _.remove(vm.data, {id: date});
      }

      _.remove(vm.data, {id});

    }

    function onJsData(event) {

      let {data, resource} = event;

      if (resource !== 'SaleOrder') {
        return;
      }

      let saleOrder = SaleOrder.get(data.id);

      if (!_.matches(SalesmanAuth.makeFilter())(data)) {
        // console.info('ignore saleOrder', data);
        return;
      } else if (vm.currentWorkflow && vm.currentWorkflow !== data.processing) {
        return onDestroySaleOrder({}, data);
      }

      if (!saleOrder) {
        saleOrder = SaleOrder.inject(data);
      }

      saleOrder.DSLoadRelations(['Outlet'])
        .then(mergeViewData)
        .catch(_.noop);

    }

    /*
     Functions
     */

    function onWorkflowChange() {

      resetVariables();
      getData();

    }

    function getWorkflows() {

      let workflowFilter = SalesmanAuth.makeFilter(_.assign({orderBy: [['date', 'DESC']]}, vm.customFilter));

      vm.workflowPromise = SaleOrder.groupBy(workflowFilter, ['processing']);

    }

    function rowHeight() {
      return isWideScreen() ? LIST_ITEM_HEIGHT : LIST_ITEM_HEIGHT_XS;
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

      getWorkflows();

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

      withData = _.filter(_.isArray(withData) ? withData : [withData], 'outlet');

      saleOrders.push(...withData);

      if (vm.currentWorkflow) {
        saleOrders = _.filter(saleOrders, {processing: vm.currentWorkflow});
      }

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

      if (!vm.currentWorkflow) {

        let lsCurrentWorkflow = localStorageService.get('currentWorkflow');

        if (lsCurrentWorkflow) {
          vm.currentWorkflow = lsCurrentWorkflow;
        }

      }

      if (busyGettingData || gotAllData) {
        return;
      }

      vm.isReady = false;

      let filter = SalesmanAuth.makeFilter(_.assign({orderBy: ['date', 'DESC']}, vm.customFilter));

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

          let promises = _.map(res, saleOrder => saleOrder.DSLoadRelations(['Outlet']).catch(_.noop));

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

    function saleOrderItemClick(item) {

      //if (vm.disableElements) {
      //  return;
      //}

      $state.go('sales.saleOrders.item', {id: item.id});

    }

    function newItemClick() {
      let params = {};
      let {outletId} = vm.customFilter || {};
      if (outletId) {
        params.outletId = outletId;
      }
      $state.go('sales.catalogue.saleOrder', params);
    }

  }

})(angular.module('Sales'));
