'use strict';

(function () {

  function VisitsController(Schema, SalesmanAuth, $scope, $state, saControllerHelper, mapsHelper, $filter) {

    const {Visit, Outlet} = Schema.models();
    const {yLatLng, distanceFn} = mapsHelper;
    const numberFilter = $filter('number');

    let today = moment().toDate();
    today.setHours(0, 0, 0, 0);
    let events;

    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

      visits: [],
      selectedDayVisits: [],

      selectedDate: moment($state.params.date).toDate(),
      initDate: today,
      maxDate: today,
      minDate: today,
      getDayClass,

      visitClick,
      newVisitClick,
      outletDistance

    });

    /*
     Listeners
     */

    SalesmanAuth.watchCurrent($scope, salesman => {

      vm.selectedSalesmanId = _.get(salesman, 'id');
      findVisitDays()
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

      vm.maxDate = new Date();
      vm.maxDate.setHours(0, 0, 0, 0);

      filterVisitsBySelectedDate();

      $state.go('.', {date: dateFormatted(vm.selectedDate)}, {notify: false});

    }

    function findVisitDays() {

      return vm.setBusy(
        Visit.groupBy(salesmanFilter(),['date'])
          .then(res => markDaysWithVisits(res)),
        'Загрузка данных визитов'
      );

    }

    function dateFormatted(date) {
      return moment(date).format();
    }

    function markDaysWithVisits() {

      events = _.groupBy(vm.visits, 'date');
      events [dateFormatted(vm.maxDate)] = {status: 'today'};

      vm.minDate = moment(_.min(_.map(events, (visits, date) => date))).toDate();

    }

    function filterVisitsBySelectedDate() {

      let dateFilter = {date: dateFormatted(vm.selectedDate)};
      let filter = salesmanFilter(dateFilter);

      vm.setBusy(
        Visit.findAllWithRelations(filter, {bypassCache: true})(
          ['Location', 'VisitAnswer', 'Outlet', 'VisitPhoto']
        ).catch(e => console.warn(e)),
        'Загрузка данных дня'
      );

      vm.rebindAll(Visit, filter, 'vm.selectedDayVisits', () => {
        _.map(vm.selectedDayVisits, visit => {
          return visit.outletId && Outlet.loadRelations(visit.outletId, 'Location')
              .catch(e => console.warn(e, visit.outletId));
        })
      });

    }

    function salesmanFilter(filter) {
      return SalesmanAuth.makeFilter(filter);
    }

    function getDayClass(data) {

      let {date, mode} = data;

      if (mode === 'day') {

        let event = events [dateFormatted(dateFormatted(date))];
        if (!event) return;
        return _.isArray(event) ? 'haveVisit' : event.status;

      }

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
