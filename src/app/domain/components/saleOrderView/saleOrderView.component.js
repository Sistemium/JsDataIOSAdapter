'use strict';

(function (module) {

  module.component('saleOrderView', {

    bindings: {
      giveData: '<'
    },

    templateUrl: 'app/domain/components/saleOrderView/saleOrderView.html',

    controller: saleOrderView,
    controllerAs: 'vm'

  });


  function saleOrderView($scope, SalesmanAuth, $state, Helpers, SaleOrderHelper, saMedia, localStorageService) {

//    const {ScrollHelper, saControllerHelper} = Helpers;
//
//    let vm = saControllerHelper
//      .setup(this, $scope)
//      .use(SaleOrderHelper);
//
//    vm.use({
//
//      data: [],
//      rootState: 'sales.saleOrders',
//      rowHeight,
//      $onInit
//
//    })
//      .use(ScrollHelper);
//
//    /*
//     Listeners
//     */
//
////    SalesmanAuth.watchCurrent($scope, onSalesmanChange);
//
//
//    /*
//     Functions
//     */
//
//    function $onInit() {
//      mergeViewData();
//    }
//
//    function rowHeight() {
//      return isWideScreen() ? LIST_ITEM_HEIGHT : LIST_ITEM_HEIGHT_XS;
//    }
//
//    function isWideScreen() {
//      return !saMedia.xsWidth && !saMedia.xxsWidth;
//    }
//
//    function resetVariables() {
//
//      vm.data = [];
//
//      localStorageService.remove(vm.rootState + '.scroll');
//
//    }
//
//    function onSalesmanChange(salesman) {
//
//      vm.currentSalesman = _.get(salesman, 'id') || _.get(SalesmanAuth.getCurrentUser(), 'id') || null;
//      resetVariables();
//
//    }
//
//    function mergeViewData(withData) {
//
//
//      //withData = _.isArray(withData) ? withData : [withData];
//      //
//      //vm.giveData.push(...withData);
//      //
//      //let saleOrdersWithDates = [];
//      //let dates = _.groupBy(vm.giveData, 'date');
//      //
//      //dates = _.map(dates, (val, date) => {
//      //  return {date, id: date};
//      //});
//      //
//      //saleOrdersWithDates.push(...dates);
//      //saleOrdersWithDates.push(...vm.giveData);
//      //
//      //saleOrdersWithDates = _.uniqBy(saleOrdersWithDates, 'id');
//      //
//      //vm.data = _.orderBy(saleOrdersWithDates, ['date'], ['desc']);
//
//    }

  }

})(angular.module('Sales'));
