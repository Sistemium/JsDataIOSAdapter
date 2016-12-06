'use strict';

(function () {

  function ScheduleController(saControllerHelper, $scope, SalesmanAuth) {

    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

    });

    /*
     Listeners
     */

    SalesmanAuth.watchCurrent($scope, salesman => {

      vm.selectedSalesmanId = _.get(salesman, 'id');
      setupNewDay();

    });

    $scope.$watch(
      () => new Date().setHours(0, 0, 0, 0),
      (todayTime, oldValue) => {
        (todayTime != oldValue) && setupNewDay(todayTime);
      }
    );

    /*
     Functions
     */

    function setupNewDay(todayTime) {

      if (_.isUndefined(todayTime)) todayTime = new Date().setHours(0, 0, 0, 0);

      vm.todayDate = new Date(todayTime);
      console.log('new day started', vm.todayDate);

      vm.currentWeek = [vm.todayDate];

      for (var i = 1; i < 7; i++) {

        var day = _.clone(vm.todayDate);
        day.setDate(day.getDate() + i);
        vm.currentWeek.push(new Date(day));

      }

      console.log(vm.currentWeek);

    }
  }

  angular.module('webPage')
    .controller('ScheduleController', ScheduleController)
  ;

}());
