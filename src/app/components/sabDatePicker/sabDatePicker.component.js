(function () {

  angular.module('sistemium')
    .component('sabDatePicker', {

      bindings: {
        value: '=',
        minDate: '<',
        maxDate: '<',
        initDate: '<',
        clearText: '@'
      },

      templateUrl: 'app/components/sabDatePicker/sabDatePicker.html',
      controller: sabDatePickerController,
      controllerAs: 'vm'

    });

  function sabDatePickerController($scope) {

    const vm = _.assign(this, {

      nextDayClick,
      prevDayClick,

      $onInit: onInit

    });

    function onInit() {

      vm.date = dateWithoutTime(vm.value);

      vm.datepickerOptions = _.defaults({
        minDate: dateWithoutTime(vm.minDate),
        maxDate: dateWithoutTime(vm.maxDate),
        initDate: vm.initDate
      }, $scope.datepickerOptions);


      $scope.$watch('vm.value', (nv, ov) => {
        if (ov == nv) return;
        vm.date = moment(vm.value).toDate();
      });

      $scope.$watch('vm.date', (nv, ov) => {
        if (ov == nv) return;
        if (!nv) vm.date = vm.datepickerOptions.initDate;
        vm.value = moment(vm.date).format('YYYY-MM-DD');
      });

    }

    function dateWithoutTime(date) {
      return moment(moment(date).format('YYYY-MM-DD')).toDate();
    }

    function nextDayClick() {
      vm.date = _.max([
        moment(vm.datepickerOptions.minDate),
        moment(vm.date).add(1, 'day')
      ]).toDate();
    }

    function prevDayClick() {

      vm.date = _.min([
        moment(vm.datepickerOptions.maxDate),
        moment(vm.date).add(-1, 'day')
      ]).toDate();

    }

  }


})();
