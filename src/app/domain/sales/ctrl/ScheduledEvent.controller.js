'use strict';

(function () {

  function ScheduledEventController(Schema, saControllerHelper, $scope, SalesmanAuth, $state, ConfirmModal, saEtc) {

    const {Schedule} = Schema.models();
    const {SchedulePurpose} = Schema.models();
    const {ScheduledEvent} = Schema.models();
    const {Outlet} = Schema.models();

    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

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

      } else {

        vm.setBusy(ScheduledEvent.find(scheduledEventId, {bypassCache: true}), 'Загрузка события')
          .then((scheduledEvent) => {

            console.log(scheduledEvent);
            vm.scheduledEvent = scheduledEvent;

          });

      }

    }

    function clearSearchOutletClick(id) {
      vm.search = '';
      saEtc.focusElementById(id);
    }

    function searchOutletClick(outlet) {
      vm.scheduledEvent.outlet = outlet;
      vm.isOpenOutletPopover = false;
    }

    function saveScheduledEvent() {
      console.log('saveScheduledEvent');
    }

    function eventHaveChanges() {

      if (vm.creatingMode) {
        return !_.isUndefined(vm.scheduledEvent.outlet);
      } else {
        return true;
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
