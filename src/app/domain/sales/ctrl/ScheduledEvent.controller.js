'use strict';

(function () {

  function ScheduledEventController(Schema, saControllerHelper, $scope, SalesmanAuth, $state, ConfirmModal) {

    const {Schedule} = Schema.models();
    const {SchedulePurpose} = Schema.models();
    const {ScheduledEvent} = Schema.models();

    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

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
    });

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

      console.log(toState, toParams, fromState, fromParams);
      vm.fromState = fromState;
      vm.toParams = toParams;
      controllerInit(toParams);

    });

    /*
     Functions
     */

    function controllerInit(params) {

      var scheduledEventId = params.scheduledEventId;
      vm.creatingMode = _.isUndefined(scheduledEventId);

      if (vm.creatingMode) {

        vm.date = params.date;

      } else {

        vm.setBusy(ScheduledEvent.find(scheduledEventId, {bypassCache: true}), 'Загрузка события')
          .then((scheduledEvent) => {

            console.log(scheduledEvent);
            vm.scheduledEvent = scheduledEvent;
            vm.date = scheduledEvent.date;
            vm.outlet = scheduledEvent.outlet;
            vm.purpose = scheduledEvent.purpose;
            vm.schedule = scheduledEvent.schedule;

          });

      }

    }

    function saveScheduledEvent() {
      console.log('saveScheduledEvent');
    }

    function eventHaveChanges() {

      if (vm.creatingMode) {
        return !_.isUndefined(vm.scheduledEvent);
      } else {
        return (vm.outlet !== vm.scheduledEvent.outlet || vm.purpose !== vm.scheduledEvent.purpose || vm.schedule !== vm.scheduledEvent.schedule);
      }

    }

    function cancelChanges() {
      console.log('cancelChanges');
    }

    function closeView() {

      if (vm.creatingMode) {

        ConfirmModal.show({
          text: `Закрыть карточку события?`
        })
          .then(function () {

            console.log('have to destroy created object');
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
