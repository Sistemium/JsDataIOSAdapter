'use strict';

(function () {

    function VisitsController(Schema, SalesmanAuth) {

        var vm = this;

        _.assign(vm, {

            visits: [],

            selectedDate: new Date(),
            selectPreviousDay,
            previousDayAvailable,
            selectNextDay,
            nextDayAvailable,

            datepickerPopup: {opened: false},
            datepickerOptions: datepickerOptions(),
            openDatepicker

        });

        var Visit = Schema.model('Visit');
        var salesman = SalesmanAuth.getCurrentUser();

        findVisits();

        function findVisits() {

            var filter = {
                salesmanId: salesman.id
            };

            vm.busy = Visit.findAll(filter)
                .then((visits) => {

                    vm.visits = visits;
                    vm.datepickerOptions = datepickerOptions();

                });

        }

        function selectPreviousDay() {

            var previousDay = vm.selectedDate;
            previousDay.setDate(previousDay.getDate() - 1);
            vm.selectedDate = new Date(previousDay);

        }

        function previousDayAvailable() {
            return (vm.selectedDate < new Date());
        }

        function selectNextDay() {

            if (!nextDayAvailable) return;

            var nextDay = vm.selectedDate;
            nextDay.setDate(nextDay.getDate() + 1);
            vm.selectedDate = new Date(nextDay);

        }

        function nextDayAvailable() {
            return (vm.selectedDate < new Date());
        }

        function maxDate() {
            return new Date();
        }

        function minDate() {

            if (!vm.visits || vm.visits.length == 0) return maxDate();

            var firstVisitDate = _.get(_.first(_.sortBy(vm.visits, 'deviceCts')), 'deviceCts');
            firstVisitDate = _.truncate(firstVisitDate, {'separator':' ', length: '10', omission: ''});

            return new Date(firstVisitDate);

        }

        function datepickerOptions() {

            return {
                maxDate: maxDate(),
                minDate: minDate(),
                startingDay: 1,
                showWeeks: false
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
