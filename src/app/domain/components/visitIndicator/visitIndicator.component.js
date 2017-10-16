(function () {

  angular.module('webPage')
    .component('visitIndicator', {

      templateUrl: 'app/domain/components/visitIndicator/visitIndicator.html',
      controller: visitIndicatorController,
      controllerAs: 'vm'

    });

  function visitIndicatorController($scope, $state, Schema, SalesmanAuth) {

    const {Visit} = Schema.models();

    const vm = _.assign(this, {indicatorClick});

    SalesmanAuth.watchCurrent($scope, getData);

    /*
    Functions
     */

    function getData() {

      let filter = SalesmanAuth.makeFilter({
        finished: false,
        date: moment().format()
      });

      Visit.bindAll(filter, $scope, 'vm.visits', onVisit);

    }

    function onVisit() {
      vm.currentVisit = _.first(vm.visits);
    }

    function indicatorClick() {
      if (!vm.currentVisit) return;
      $state.go('sales.visits.outlet.visitCreate', {visitId: vm.currentVisit.id, id: vm.currentVisit.outletId});
    }

  }


})();
