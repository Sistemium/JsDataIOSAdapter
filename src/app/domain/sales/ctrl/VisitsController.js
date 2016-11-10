'use strict';

(function () {

    function VisitsController() {

        var vm = this;

        _.assign(vm, {

            selectedDate: new Date(),
            selectPreviousDay,
            selectNextDay,

            datepickerPopup: {opened: false},
            datepickerOptions: datepickerOptions(),
            openDatepicker

        });

        function selectPreviousDay() {

            var previousDay = vm.selectedDate;
            previousDay.setDate(previousDay.getDate() - 1);
            vm.selectedDate = new Date(previousDay);

        }

        function selectNextDay() {

            var nextDay = vm.selectedDate;
            nextDay.setDate(nextDay.getDate() + 1);
            vm.selectedDate = new Date(nextDay);

        }

        function datepickerOptions() {

            return {
                maxDate: new Date(),
                minDate: new Date(2016, 5, 22),
                startingDay: 1
            };

        }

        function openDatepicker() {
            vm.datepickerPopup.opened = true;
        }

    }

    angular.module('webPage')
        .controller('VisitsController', VisitsController)
    ;

}());
