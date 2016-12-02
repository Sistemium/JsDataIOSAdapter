'use strict';

(function () {

  function VisitsController(Schema, SalesmanAuth, $scope, $state, saControllerHelper) {

    var vm = saControllerHelper.setup(this, $scope);

    vm.use({

      visits: [],
      selectedDayVisits: [],

      selectedDate: null,
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

    var {Visit} = Schema.models();
    var salesman = SalesmanAuth.getSelectedSalesman();

    scopeRoutines();
    findVisits();

    function scopeRoutines() {

      $scope.$on('rootClick', () => $state.go('sales.visits'));

      $scope.$watch('vm.selectedDate', _.debounce(setDate, 500));

      $scope.$watch(
        () => new Date().setHours(0,0,0,0),
        todayTime => vm.selectedDate = new Date(todayTime)
      );

    }

    function setDate(newValue) {

      if (!angular.isObject(newValue)) {
        vm.selectedDate = new Date();
      }

      filterVisitsBySelectedDate();

    }

    function findVisits() {

      var filter = {};
      if (salesman) filter.salesmanId = salesman.id;

      vm.setBusy(Visit.findAll(filter, {bypassCache: true}), 'Загрузка данных визитов')
        .then(() => {

          Visit.bindAll(filter, $scope, 'vm.visits', () => {

            vm.datepickerOptions = datepickerOptions();
            markDaysWithVisits();

          });

        });

    }

    function markDaysWithVisits() {

      var visitDays = _.map(vm.visits, (visit) => {
        return _.truncate(_.get(visit, 'deviceCts'), {'separator': ' ', length: '10', omission: ''});
      });

      vm.events = [{
        date: maxDate(),
        status: 'today'
      }];

      _.forEach(visitDays, (visitDay) => {

        vm.events.push({
          date: new Date(visitDay),
          status: 'haveVisit'
        });

      });

    }

    function filterVisitsBySelectedDate() {

      var filter = {
        date: moment(vm.selectedDate).format('YYYY-MM-DD')
      };

      if (salesman) filter.salesmanId = salesman.id;

      vm.setBusy(
        Visit.findAllWithRelations(filter, {bypassCache: true})(
          ['Location', 'VisitAnswer', 'Outlet', 'VisitPhoto']
        ),
        'Загрузка данных дня'
      );

      vm.rebindAll(Visit, filter, 'vm.selectedDayVisits');

    }

    function selectPreviousDay() {

      if (!previousDayAvailable()) return;

      var previousDay = vm.selectedDate;
      previousDay.setDate(previousDay.getDate() - 1);
      vm.selectedDate = new Date(previousDay);

    }

    function previousDayAvailable() {
      return vm.selectedDate ? (vm.selectedDate.setHours(0,0,0,0) > minDate()) : false;
    }

    function selectNextDay() {

      if (!nextDayAvailable()) return;

      var nextDay = vm.selectedDate;
      nextDay.setDate(nextDay.getDate() + 1);
      vm.selectedDate = new Date(nextDay);

    }

    function nextDayAvailable() {
      return vm.selectedDate ? (vm.selectedDate.setHours(0,0,0,0) < maxDate()) : false;
    }

    function maxDate() {

      var maxDate = new Date();
      maxDate.setHours(0, 0, 0, 0);

      return maxDate;

    }

    function minDate() {

      if (!vm.visits || vm.visits.length == 0) return maxDate();

      var firstVisitDate = _.get(_.first(_.sortBy(vm.visits, 'deviceCts')), 'deviceCts');
      firstVisitDate = _.truncate(firstVisitDate, {'separator': ' ', length: '10', omission: ''});

      var minDate = new Date(firstVisitDate);
      minDate.setHours(0, 0, 0, 0);

      return minDate;

    }

    function datepickerOptions() {

      return {
        customClass: getDayClass,
        maxDate: maxDate(),
        minDate: minDate(),
        startingDay: 1,
        showWeeks: false
      };

    }

    function getDayClass(data) {

      var date = data.date,
        mode = data.mode;

      if (mode === 'day') {

        var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

        for (var i = 0; i < vm.events.length; i++) {

          var currentDay = new Date(vm.events[i].date).setHours(0, 0, 0, 0);

          if (dayToCheck === currentDay) {
            return vm.events[i].status;
          }

        }

      }

      return '';

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
