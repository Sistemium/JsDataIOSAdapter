'use strict';

(function () {

  function SaleOrderController(Schema, $scope, saControllerHelper, SalesmanAuth, $state) {

    let vm = saControllerHelper.setup(this, $scope);
    let {SaleOrder} = Schema.models();
    let salesman = SalesmanAuth.getCurrentUser();

    vm.use({

      visits: [],
      data: [],

      selectedDate: moment($state.params.date).toDate(),

      datepickerPopup: {opened: false},
      datepickerOptions: datepickerOptions(),
      openDatepicker,
      selectPreviousDay,
      selectNextDay,

      itemClick,
      newItemClick

    });

    getData();

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


    function getData() {

      let filter = {
        salesmanId: salesman.id,
        date: moment(vm.selectedDate).format('YYYY-MM-DD')
      };

      vm.setBusy(
        SaleOrder.findAllWithRelations(filter, {bypassCache: true})(
          ['Outlet']
        ),
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
        startingDay: 1,
        showWeeks: false
      };

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
