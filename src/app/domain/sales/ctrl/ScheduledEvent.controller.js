'use strict';

(function () {

  function ScheduledEventController(Schema, saControllerHelper, $scope, SalesmanAuth, $state, ConfirmModal) {

    const {Schedule} = Schema.models();
    const {SchedulePurpose} = Schema.models();
    const {ScheduledEvent} = Schema.models();

    let vm = saControllerHelper.setup(this, $scope);

    vm.use({
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
            vm.date = scheduledEvent.date;

          });

      }

    }

    function closeView() {

      if (vm.creatingMode) {

        ConfirmModal.show({
          text: `Отменить создание события?`
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
