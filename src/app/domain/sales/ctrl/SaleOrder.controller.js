'use strict';

(function () {

  function SaleOrderController(Schema, $scope, saControllerHelper, SalesmanAuth, $state) {

    let vm = saControllerHelper.setup(this, $scope);
    let {SaleOrder} = Schema.models();

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
      newItemClick

    });

    SalesmanAuth.watchCurrent($scope, getData);

    /*
     Listeners
     */

    $scope.$on('rootClick', () => $state.go('sales.saleOrders'));
    $scope.$watch('vm.selectedDate', _.debounce(setDate, 500));

    /*
     Functions
     */

    function setDate(newValue) {

      if (!angular.isObject(newValue)) {
        vm.selectedDate = new Date();
      }

      $state.go('.', {date: moment(vm.selectedDate).format('YYYY-MM-DD')});

    }


    function getData(salesman) {

      vm.currentSalesman = salesman;

      let filter = SalesmanAuth.makeFilter({
        date: moment(vm.selectedDate).format('YYYY-MM-DD')
      });

      vm.setBusy(
        SaleOrder.findAllWithRelations(filter, {bypassCache: true})(['Outlet']),
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
