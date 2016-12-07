'use strict';

(function () {

  function ScheduledEventController(Schema, saControllerHelper, $scope, SalesmanAuth, $state) {

    const {Schedule} = Schema.models();
    const {SchedulePurpose} = Schema.models();
    const {ScheduledEvent} = Schema.models();

    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

    });

    var scheduledEventId = $state.params.scheduledEventId;
    _.isUndefined(scheduledEventId) && console.log('new scheduledEvent');

    /*
     Listeners
     */

    SalesmanAuth.watchCurrent($scope, salesman => {
      vm.selectedSalesmanId = _.get(salesman, 'id');
    });

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      console.log(toState, toParams, fromState, fromParams);
    });

    /*
     Functions
     */

  }

  angular.module('webPage')
    .controller('ScheduledEventController', ScheduledEventController)
  ;

}());
