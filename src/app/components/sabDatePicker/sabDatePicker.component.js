(function () {

  angular.module('sistemium')
    .component('sabDatePicker', {

      bindings: {
        value: '=',
        minDate: '<',
        maxDate: '<',
        initDate: '<',
        customClass: '<',
        clearText: '@',
        clearTextFn: '<'
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
        initDate: vm.initDate,
        customClass: vm.customClass,
        clearTextFn: vm.clearTextFn
      }, $scope.datepickerOptions);


      $scope.$watch('vm.value', (nv, ov) => {

        // if (ov == nv) return; // suddenly comparing values via '==' stop working
        if (moment(ov).isSame(nv, 'day')) return;
        vm.date = dateWithoutTime(vm.value);

      });

      $scope.$watch('vm.date', (nv, ov) => {

        // if (ov == nv) return; // suddenly comparing values via '==' stop working
        if (!nv) vm.date = vm.clearTextFn(); //!nv —> means clear text button pressed
        if (moment(ov).isSame(nv, 'day')) return;
        vm.value = dateWithoutTime(vm.date);

      });

      $scope.$watch('vm.minDate', () => {

        vm.datepickerOptions = _.defaults({
          minDate: dateWithoutTime(vm.minDate)
        }, vm.datepickerOptions);

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
