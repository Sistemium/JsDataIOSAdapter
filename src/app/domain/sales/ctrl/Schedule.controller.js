'use strict';

(function () {

  function ScheduleController(Schema, saControllerHelper, $scope, SalesmanAuth, $state) {

    //const {Schedule} = Schema.models();
    //const {SchedulePurpose} = Schema.models();
    const {ScheduledEvent} = Schema.models();

    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

      createScheduledEvent,
      displayDate,
      colorDate

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

      findScheduledEvents();

    }

    function findScheduledEvents() {

      var filter = SalesmanAuth.makeFilter();

      vm.setBusy(ScheduledEvent.findAll(filter, {bypassCache: true}), 'Загрузка расписания')
        .then(() => {

          ScheduledEvent.bindAll(filter, $scope, 'vm.scheduledEvents', () => {
            console.log(vm.scheduledEvents);
          });

        });

    }

    function createScheduledEvent(day) {
      $state.go('^.scheduledEvent', {date: day});
    }

    function displayDate(date) {

      var dateString = moment(date).format('dddd, DD/MM/YYYY');

      if (isToday(date)) {
        return 'Сегодня, ' + dateString;
      }

      if (isTomorrow(date)) {
        return 'Завтра, ' + dateString;
      }

      if (isYesterday(date)) {
        return 'Вчера, ' + dateString;
      }

      return _.capitalize(dateString);

    }

    function colorDate(date) {

      var dayOfWeek = moment(date).format('d');

      return (isToday(date)) ? 'blue' : (dayOfWeek == 0 || dayOfWeek == 6) ? 'red' : '';

    }

    function isToday(date) {
      return date.getDate() == vm.todayDate.getDate();
    }

    function isTomorrow(date) {
      return date.getDate() == vm.todayDate.getDate() + 1;
    }

    function isYesterday(date) {
      return date.getDate() == vm.todayDate.getDate() - 1;
    }

  }

  angular.module('webPage')
    .controller('ScheduleController', ScheduleController)
  ;

}());
