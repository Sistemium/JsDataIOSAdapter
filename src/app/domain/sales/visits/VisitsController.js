'use strict';

(function () {

  function VisitsController(Schema, SalesmanAuth, $scope, $state, saControllerHelper, $filter, geolib, Sockets) {

    const {Visit, Outlet} = Schema.models();
    const numberFilter = $filter('number');

    let events;

    let today = todayFn();

    let vm = saControllerHelper.setup(this, $scope);

    // let SUBSCRIPTIONS = ['Visit'];

    vm.use({

      selectedDayVisits: [],

      selectedDate: $state.params.date,
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

    $scope.$watch(() => new Date().setHours(0, 0, 0, 0), (todayTime, oldValue) => {

      if (todayTime != oldValue) {

        today = todayFn();
        vm.selectedDate = today;
        vm.initDate = today;

      }

    });

    // Sockets.jsDataSubscribe(SUBSCRIPTIONS);
    Sockets.onJsData('jsData:update', onJSData);

    /*
     Functions
     */

    function onJSData(event) {

      if (event.resource !== 'Visit') {
        return;
      }

      let model = Schema.model(event.resource);

      if (!model) {
        return;
      }

      console.warn(event.data);

      let instance = model.inject(event.data);

      model.loadRelations(instance);

    }

    function outletDistance(visit) {
      let outletLocation = _.get(visit, 'outlet.location');
      if (outletLocation) {
        let res = geolib.getDistance(outletLocation, visit.checkInLocation);
        return `${numberFilter(res, 0)}м.`
      }
    }


    function setDate(newValue) {

      if (!newValue) {
        vm.selectedDate = vm.initDate;
      }

      filterVisitsBySelectedDate();

      $state.go('.', {date: dateFormatted(vm.selectedDate)}, {notify: false});

    }

    function findVisitDays() {

      return vm.setBusy(
        // TODO: have to renew this at days and visits change
        Visit.groupBy(salesmanFilter(), ['date'])
          .then(res => eventsWithVisitDays(res)),
        'Загрузка данных визитов'
      );

    }

    function dateFormatted(date) {
      return moment(date).format();
    }

    function eventsWithVisitDays(visitDays) {

      events = _.keyBy(visitDays, 'date');
      events [dateFormatted(vm.maxDate)] = {status: 'today'};
      vm.minDate = moment(_.min(_.map(visitDays, 'date'))).format();

    }

    function filterVisitsBySelectedDate() {

      const visitRelations = ['Location', 'VisitAnswer', 'Outlet', 'VisitPhoto'];

      let dateFilter = {date: dateFormatted(vm.selectedDate)};
      let filter = salesmanFilter(dateFilter);

      let q = Visit.findAllWithRelations(filter, {bypassCache: true})(visitRelations)
        .then(() => {
          vm.rebindAll(Visit, filter, 'vm.selectedDayVisits', loadOutletLocations);
        })
        .catch(e => console.warn(e));

      vm.setBusy(q, 'Загрузка данных дня');

    }

    function loadOutletLocations() {
      _.map(vm.selectedDayVisits, visit => {
        return visit.outletId && Outlet.loadRelations(visit.outletId, 'Location')
          .catch(e => console.warn(e, visit.outletId));
      });
    }

    function salesmanFilter(filter) {
      return SalesmanAuth.makeFilter(filter);
    }

    function getDayClass(data) {

      let {date, mode} = data;

      if (mode === 'day') {

        let event = events [dateFormatted(date)];
        if (!event) return;
        return event['count()'] ? 'haveVisit' : event.status;

      }

    }

    function todayFn() {
      return moment().format();
    }

    function visitClick(visit) {

      let creating = visit.date === moment().format() && visit.finished === false;

      $state.go(`.outlet.visit${creating ? 'Create' : ''}`, {visitId: visit.id, id: visit.outlet.id});
    }

    function newVisitClick() {
      $state.go('.territory');
    }

  }

  angular.module('webPage')
    .controller('VisitsController', VisitsController);

})();
