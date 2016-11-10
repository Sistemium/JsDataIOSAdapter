'use strict';

(function () {

    function VisitsController(Schema, SalesmanAuth, $scope) {

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

        $scope.$watch('vm.selectedDate',  (newValue) => {

            if (!angular.isObject(newValue)) {
                vm.selectedDate = new Date();
            }

        });

        findVisits();

        function findVisits() {

            var filter = {
                salesmanId: salesman.id
            };

            vm.busy = Visit.findAll(filter)
                .then((visits) => {

                    vm.visits = visits;
                    vm.datepickerOptions = datepickerOptions();
                    markDaysWithVisits();

                });

        }

        function markDaysWithVisits() {

            var visitDays = _.map(vm.visits, (visit) => {
                return _.truncate(_.get(visit, 'deviceCts'), {'separator':' ', length: '10', omission: ''})
            });

            console.log(_.uniq(visitDays));

            vm.events = [{
                date: maxDate(),
                status: 'today'
            }];

            _.forEach(visitDays, (visitDay) => {

                vm.events.push({
                    date: new Date(visitDay),
                    status: 'haveVisit'
                });

            });

        }

        function selectPreviousDay() {

            if (!previousDayAvailable()) return;

            var previousDay = vm.selectedDate;
            previousDay.setDate(previousDay.getDate() - 1);
            vm.selectedDate = new Date(previousDay);

        }

        function previousDayAvailable() {
            return (vm.selectedDate > minDate().setDate(minDate().getDate() + 1));
        }

        function selectNextDay() {

            if (!nextDayAvailable()) return;

            var nextDay = vm.selectedDate;
            nextDay.setDate(nextDay.getDate() + 1);
            vm.selectedDate = new Date(nextDay);

        }

        function nextDayAvailable() {
            return (vm.selectedDate < maxDate());
        }

        function maxDate() {

            var maxDate = new Date();
            maxDate.setHours(0,0,0,0);

            return maxDate;

        }

        function minDate() {

            if (!vm.visits || vm.visits.length == 0) return maxDate();

            var firstVisitDate = _.get(_.first(_.sortBy(vm.visits, 'deviceCts')), 'deviceCts');
            firstVisitDate = _.truncate(firstVisitDate, {'separator':' ', length: '10', omission: ''});

            var minDate = new Date(firstVisitDate);
            minDate.setHours(0,0,0,0);

            return minDate;

        }

        function datepickerOptions() {

            return {
                customClass: getDayClass,
                maxDate: maxDate(),
                minDate: minDate(),
                startingDay: 1,
                showWeeks: false
            };

        }

        function getDayClass(data) {

            var date = data.date,
                mode = data.mode;

            if (mode === 'day') {

                var dayToCheck = new Date(date).setHours(0,0,0,0);

                for (var i = 0; i < vm.events.length; i++) {

                    var currentDay = new Date(vm.events[i].date).setHours(0,0,0,0);

                    if (dayToCheck === currentDay) {
                        return vm.events[i].status;
                    }

                }

            }

            return '';

        }

        function openDatepicker() {
            vm.datepickerPopup.opened = true;
        }

    }

    angular.module('webPage')
        .controller('VisitsController', VisitsController)
    ;

}());
