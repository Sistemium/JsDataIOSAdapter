'use strict';

(function () {

  function VisitsController(Schema, SalesmanAuth, $scope, $state, saControllerHelper) {

    const {Visit} = Schema.models();

    let maxDate;
    let minDate;

    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

      visits: [],
      selectedDayVisits: [],

      selectedDate: moment($state.params.date).toDate(),
      selectPreviousDay,
      previousDayAvailable,
      selectNextDay,
      nextDayAvailable,

      datepickerPopup: {opened: false},
      datepickerOptions: datepickerOptions(),
      openDatepicker,

      visitClick,
      newVisitClick

    });

    /*
     Listeners
     */

    SalesmanAuth.watchCurrent($scope, salesman => {

      vm.selectedSalesmanId = _.get(salesman, 'id');
      findVisits();
      filterVisitsBySelectedDate();

    });

    $scope.$on('rootClick', () => $state.go('sales.visits'));

    $scope.$watch('vm.selectedDate', _.debounce(setDate, 500));

    $scope.$watch(
      () => new Date().setHours(0, 0, 0, 0),
      (todayTime, oldValue) => {
        if (todayTime != oldValue) {
          vm.selectedDate = new Date(todayTime);
        }
      }
    );

    /*
     Functions
     */

    function setDate(newValue) {

      if (!angular.isObject(newValue)) {
        vm.selectedDate = new Date();
      }

      maxDate = new Date();
      maxDate.setHours(0, 0, 0, 0);

      filterVisitsBySelectedDate();

      $state.go('.', {date: dateFormatted(vm.selectedDate)}, {notify: false});

    }

    function findVisits() {

      var filter = salesmanFilter();

      vm.setBusy(Visit.findAll(filter, {bypassCache: true}), 'Загрузка данных визитов');

      vm.rebindAll(Visit, filter, 'vm.visits', () => {
        markDaysWithVisits();
        vm.datepickerOptions = datepickerOptions();
      });


    }

    function dateFormatted(date) {
      return moment(date).format('YYYY-MM-DD');
    }

    function markDaysWithVisits() {

      vm.events = _.groupBy(vm.visits, 'date');

      vm.events [dateFormatted(maxDate)] = {status: 'today'};

      minDate = moment(_.min(_.map(vm.events, (visits, date) => date))).toDate();

    }

    function filterVisitsBySelectedDate() {

      var dateFilter = {date: dateFormatted(vm.selectedDate)};
      var filter = salesmanFilter(dateFilter);

      vm.setBusy(
        Visit.findAllWithRelations(filter, {bypassCache: true})(
          ['Location', 'VisitAnswer', 'Outlet', 'VisitPhoto']
        ),
        'Загрузка данных дня'
      );

      vm.rebindAll(Visit, filter, 'vm.selectedDayVisits');

    }

    function salesmanFilter(filter) {
      return SalesmanAuth.makeFilter(filter);
    }

    function selectPreviousDay() {

      if (!previousDayAvailable()) return;

      var previousDay = vm.selectedDate;
      previousDay.setDate(previousDay.getDate() - 1);
      vm.selectedDate = new Date(previousDay);

    }

    function selectNextDay() {

      if (!nextDayAvailable()) return;

      var nextDay = vm.selectedDate;
      nextDay.setDate(nextDay.getDate() + 1);
      vm.selectedDate = new Date(nextDay);

    }

    function previousDayAvailable() {
      return vm.selectedDate && vm.selectedDate > minDate;
    }

    function nextDayAvailable() {
      return vm.selectedDate && vm.selectedDate < maxDate;
    }

    function datepickerOptions() {

      return {
        customClass: getDayClass,
        maxDate,
        minDate,
        startingDay: 1,
        showWeeks: false
      };

    }

    function getDayClass(data) {

      let {date, mode} = data;

      if (mode === 'day') {

        let event = vm.events[dateFormatted(dateFormatted(date))];
        if (!event) return;
        return _.isArray(event) ? 'haveVisit' : event.status;

      }

    }

    function openDatepicker() {
      vm.datepickerPopup.opened = true;
    }

    function visitClick(visit) {
      $state.go('.outlet.visit', {visitId: visit.id, id: visit.outlet.id});
    }

    function newVisitClick() {
      $state.go('.territory');
    }

  }

  angular.module('webPage')
    .controller('VisitsController', VisitsController);

}());
