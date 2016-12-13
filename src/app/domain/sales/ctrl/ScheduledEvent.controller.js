'use strict';

(function () {

  function ScheduledEventController(Schema, Helpers, $scope, SalesmanAuth, $state, ConfirmModal) {

    const {Schedule, SchedulePurpose, ScheduledEvent, Outlet} = Schema.models();
    const {saControllerHelper, ClickHelper, saEtc} = Helpers;

    let vm = saControllerHelper.setup(this, $scope)
      .use(ClickHelper);

    vm.use({

      monthDays: [...Array(32).keys()].slice(1),
      //weekDays: [...Array(7).keys()],
      weekDays: ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'],
      setMonthDay,
      setWeekDay,
      searchOutletClick,
      clearSearchOutletClick,
      saveScheduledEvent,
      eventHaveChanges,
      cancelChanges,
      closeView

    });

    /*
     Listeners
     */

    SalesmanAuth.watchCurrent($scope, salesman => {

      vm.selectedSalesmanId = _.get(salesman, 'id');

      Outlet.findAll(SalesmanAuth.makeFilter());
      let filter = {
        orderBy: ['name']
      };
      vm.rebindAll(Outlet, filter, 'vm.outlets');

    });

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

      console.log(toState, toParams, fromState, fromParams);

      if (fromState.name) {

        vm.fromState = fromState;
        vm.toParams = toParams;
        controllerInit(toParams);

      } else {

        $state.go('sales.schedule');

      }


    });

    /*
     Functions
     */

    function controllerInit(params) {

      var scheduledEventId = params.scheduledEventId;
      vm.creatingMode = _.isUndefined(scheduledEventId);

      if (vm.creatingMode) {

        vm.scheduledEvent = ScheduledEvent.inject({
          salesmanId: vm.selectedSalesmanId,
          dateStart: params.date
        });

        postInit();

      } else {

        vm.setBusy(ScheduledEvent.find(scheduledEventId, {bypassCache: true}), 'Загрузка события')
          .then((scheduledEvent) => {

            console.log(scheduledEvent);
            vm.scheduledEvent = scheduledEvent;

            postInit();

          });

      }

    }

    function postInit() {

      vm.monthDay = moment(vm.scheduledEvent.dateStart).format('D');
      processWeekDay(moment(vm.scheduledEvent.dateStart).format('e'));

      vm.outlet = vm.scheduledEvent.outlet;

    }

    function processWeekDay(wd) {

      vm.wdNumber = wd;

      if (_.includes('245', wd)) {

        vm.weekDayEveryWord = 'Каждую';
        vm.weekDay = vm.weekDays[wd].replace(/.$/, "у");

      } else {

        vm.weekDayEveryWord = (wd == '6') ? 'Каждое' : 'Каждый';
        vm.weekDay = vm.weekDays[wd];

      }

    }

    function clearSearchOutletClick(id) {
      vm.search = '';
      saEtc.focusElementById(id);
    }

    function searchOutletClick(outlet) {
      vm.outlet = outlet;
      vm.isOpenOutletPopover = false;
    }

    function setMonthDay(md) {

      vm.monthDay = md;
      vm.isOpenMonthDayPopover = false;

    }

    function setWeekDay(wd) {

      processWeekDay(wd);
      vm.isOpenWeekDayPopover = false;

    }

    function saveScheduledEvent() {

      console.log('saveScheduledEvent');

      if (!eventHaveChanges()) return;

      if (vm.creatingMode) {

        if (vm.isPeriodicEvent) {
          processingPeriodicData();
        }

        if (_.isObject(vm.outlet)) {
          vm.scheduledEvent.outlet = vm.outlet;
        }

        ScheduledEvent.save(vm.scheduledEvent)
          .then(() => quit())
          .catch((error) => {
            console.log(error);
          });

      }

    }

    function processingPeriodicData() {

      var periodicEventCode = periodicEventCodeFn();
      console.log(periodicEventCode);

      if (!_.isUndefined(periodicEventCode)) {

        var codeDic = {code: periodicEventCode};

        Schedule.findAll(codeDic)
          .then((schedules) => {

            var schedule = _.head(schedules);

            if (_.isUndefined(schedule)) {

              Schedule.create(codeDic)
                .then((schedule) => {
                  vm.scheduledEvent.schedule = schedule;
                });

            } else {
              vm.scheduledEvent.schedule = schedule;
            }

          });

      }

    }

    function periodicEventCodeFn() {
      return (vm.weekly) ? 'weekly.' + vm.wdNumber : (vm.monthly) ? 'monthly.' + vm.monthDay : undefined;
    }

    function eventHaveChanges() {

      if (vm.creatingMode) {
        return !_.isUndefined(vm.outlet) || vm.isPeriodicEvent;
      } else {
        return true;
      }

    }

    function cancelChanges() {

      cleanup();
      controllerInit(vm.toParams);

    }

    function cleanup() {

      _.isObject(vm.scheduledEvent) && ScheduledEvent.eject(vm.scheduledEvent);
      vm.isPeriodicEvent = false;

    }

    function closeView() {

      if (vm.creatingMode && eventHaveChanges()) {

        ConfirmModal.show({
          text: `Закрыть карточку события?`
        })
          .then(() => {

            cleanup();
            quit();

          });

      } else {
        quit();
      }

    }

    function quit() {
      $state.go(vm.fromState);
    }

  }

  angular.module('webPage')
    .controller('ScheduledEventController', ScheduledEventController)
  ;

}());
