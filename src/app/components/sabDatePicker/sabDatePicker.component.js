(function () {

  angular.module('sistemium')
    .component('sabDatePicker', {

      bindings: {
        value: '=',
        minDate: '<',
        initDate: '<'
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

      vm.date = moment(vm.value).toDate();

      vm.datepickerOptions = _.defaults({
        minDate: vm.minDate,
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

    function nextDayClick() {
      vm.date = _.max([
        moment(vm.datepickerOptions.minDate),
        moment(vm.date).add(1, 'day')
      ]).toDate();
    }

    function prevDayClick() {
      vm.date = moment(vm.date).add(-1, 'day').toDate();
    }

  }


})();
