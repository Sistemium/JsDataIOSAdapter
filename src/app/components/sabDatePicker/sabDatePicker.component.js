(function () {

  angular.module('sistemium')
    .component('sabDatePicker', {

      bindings: {
        value: '=',
        minDate: '<',
        maxDate: '<',
        initDate: '<',
        customClass: '<',
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
        minDate: vm.minDate && dateWithoutTime(vm.minDate),
        maxDate: vm.maxDate && dateWithoutTime(vm.maxDate),
        initDate: vm.initDate,
        customClass: vm.customClass
      }, $scope.datepickerOptions);


      $scope.$watch('vm.value', (nv, ov) => {

        if (ov == nv) return;
        vm.date = dateWithoutTime(vm.value);

      });

      $scope.$watch('vm.date', (nv) => {

        if (!nv) vm.date = dateWithoutTime(vm.initDate);
        vm.value = moment(vm.date.toISOString()).format();

      });

      $scope.$watch('vm.minDate', () => {

        vm.datepickerOptions = _.defaults({
          minDate: vm.minDate && dateWithoutTime(vm.minDate)
        }, vm.datepickerOptions);

      });

    }

    function dateWithoutTime(date) {
      return moment(moment(date).format()).toDate();
    }

    function nextDayClick() {
      vm.date = _.max([
        moment(vm.datepickerOptions.minDate),
        moment(vm.date.toISOString()).add(1, 'day')
      ]).toDate();
    }

    function prevDayClick() {

      vm.date = _.min([
        moment(vm.datepickerOptions.maxDate),
        moment(vm.date.toISOString()).add(-1, 'day')
      ]).toDate();

    }

  }


})();
