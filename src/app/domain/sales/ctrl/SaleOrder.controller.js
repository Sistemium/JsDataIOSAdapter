'use strict';

(function () {

  function SaleOrderController(Schema, $scope, saControllerHelper, SalesmanAuth, $state) {

    let vm = saControllerHelper.setup(this, $scope);
    let {SaleOrder, Outlet, SaleOrderPosition} = Schema.models();

    vm.use({

      visits: [],
      data: [],

      selectedDate: moment($state.params.date).toDate(),

      datepickerPopup: {opened: false},
      datepickerOptions: datepickerOptions(),
      openDatepicker,
      selectPreviousDay,
      selectNextDay,
      nextDayAvailable,

      itemClick,
      newItemClick,

      onStateChange

    });

    SalesmanAuth.watchCurrent($scope, getData);

    /*
     Listeners
     */

    $scope.$on('rootClick', () => $state.go('sales.saleOrders'));
    $scope.$watch('vm.selectedDate', _.debounce(setDate, 500));

    /*
     Handlers
     */

    function onStateChange(to) {
      if (!/sales.saleOrders/.test(to.name)) cleanup();
    }

    /*
     Functions
     */

    function cleanup() {
      SaleOrderPosition.ejectAll();
    }

    function setDate(newValue) {

      if (!angular.isObject(newValue)) {
        vm.selectedDate = new Date();
      }

      $state.go('.', {date: moment(vm.selectedDate).format('YYYY-MM-DD')});

    }


    function getData(salesman) {

      vm.currentSalesman = salesman;
      let date = moment(vm.selectedDate).format('YYYY-MM-DD');

      let filter = SalesmanAuth.makeFilter({date});

      let bySalesman = filter.salesmanId ? {
          'ANY outletSalesmanContracts': {
            'salesmanId': {
              '==': filter.salesmanId
            }
          }
        } : {};

      let saleOrderPositionsFilter = {
        date,
        where: {
          'ANY saleOrder': {
            date: {
              '==': date
            }
          }
        }
      };

      if (salesman) {
        saleOrderPositionsFilter.where['ANY saleOrder'].salesmanId = {'==': salesman.id};
      }

      vm.setBusy(
        [Outlet.findAll(_.assign({where: bySalesman}, filter))
          .then(SaleOrder.findAllWithRelations(filter, {bypassCache: true})(['Outlet'])),
          SaleOrderPosition.findAll(saleOrderPositionsFilter)],
        'Загрузка данных дня'
      );

      vm.rebindAll(SaleOrder, filter, 'vm.data');

    }

    function selectPreviousDay() {

      let previousDay = vm.selectedDate;
      previousDay.setDate(previousDay.getDate() - 1);
      vm.selectedDate = new Date(previousDay);

    }

    function selectNextDay() {

      let nextDay = vm.selectedDate;
      nextDay.setDate(nextDay.getDate() + 1);
      vm.selectedDate = new Date(nextDay);

    }

    function datepickerOptions() {


      return {
        maxDate: maxDate(),
        startingDay: 1,
        showWeeks: false
      };

    }

    function maxDate() {

      var maxDate = moment().add(7, 'days').toDate();
      maxDate.setHours(0, 0, 0, 0);
      return maxDate;

    }

    function nextDayAvailable() {
      return vm.selectedDate.setHours(0, 0, 0, 0) < maxDate();
    }

    function openDatepicker() {
      vm.datepickerPopup.opened = true;
    }

    function itemClick(item) {
      $state.go('.item', {id: item.id});
    }

    function newItemClick() {
      $state.go('.create');
    }

  }

  angular.module('webPage')
    .controller('SaleOrderController', SaleOrderController);

}());
