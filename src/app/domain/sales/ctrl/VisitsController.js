'use strict';

(function () {

  function VisitsController(Schema, SalesmanAuth, $scope, $state, saControllerHelper, mapsHelper, $filter) {

    const {Visit, Outlet} = Schema.models();
    const {yLatLng, distanceFn} = mapsHelper;
    const numberFilter = $filter('number');

    let maxDate;
    let minDate;
    let events;

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
      newVisitClick,
      outletDistance

    });

    /*
     Listeners
     */

    SalesmanAuth.watchCurrent($scope, salesman => {

      vm.selectedSalesmanId = _.get(salesman, 'id');
      findVisits()
        .then(filterVisitsBySelectedDate);

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

    function outletDistance(visit) {
      let outletLocation = _.get(visit, 'outlet.location');
      if (outletLocation) {
        let res = distanceFn(yLatLng(outletLocation), yLatLng(visit.checkInLocation));
        return `${numberFilter(res, 0)}м.`
      }
    }


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

      let filter = salesmanFilter();

      vm.rebindAll(Visit, filter, 'vm.visits', () => {
        markDaysWithVisits();
        vm.datepickerOptions = datepickerOptions();
      });

      return vm.setBusy(
        Visit.findAll(filter, {bypassCache: true}),
        'Загрузка данных визитов'
      );

    }

    function dateFormatted(date) {
      return moment(date).format();
    }

    function markDaysWithVisits() {

      events = _.groupBy(vm.visits, 'date');
      events [dateFormatted(maxDate)] = {status: 'today'};

      minDate = moment(_.min(_.map(events, (visits, date) => date))).toDate();

    }

    function filterVisitsBySelectedDate() {

      let dateFilter = {date: dateFormatted(vm.selectedDate)};
      let filter = salesmanFilter(dateFilter);

      vm.setBusy(
        Visit.findAllWithRelations(filter, {bypassCache: true})(
          ['Location', 'VisitAnswer', 'Outlet', 'VisitPhoto']
        ),
        'Загрузка данных дня'
      );

      vm.rebindAll(Visit, filter, 'vm.selectedDayVisits', () => {
        _.map(vm.selectedDayVisits, visit => {
          return Outlet.loadRelations(visit.outlet, 'Location');
        })
      });

    }

    function salesmanFilter(filter) {
      return SalesmanAuth.makeFilter(filter);
    }

    function selectPreviousDay() {

      if (!previousDayAvailable()) return;

      let previousDay = vm.selectedDate;
      previousDay.setDate(previousDay.getDate() - 1);
      vm.selectedDate = new Date(previousDay);

    }

    function selectNextDay() {

      if (!nextDayAvailable()) return;

      let nextDay = vm.selectedDate;
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

        let event = events [dateFormatted(dateFormatted(date))];
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
