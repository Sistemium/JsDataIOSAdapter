(function () {

  angular.module('webPage')
    .component('visitIndicator', {

      templateUrl: 'app/domain/components/visitIndicator/visitIndicator.html',
      controller: visitIndicatorController,
      controllerAs: 'vm'

    });

  function visitIndicatorController($scope, $state, Schema) {

    const {Visit} = Schema.models();

    const vm = _.assign(this, {indicatorClick});

    Visit.bindAll({finished: false}, $scope, 'vm.visits', onVisit);

    /*
    Functions
     */

    function onVisit() {
      vm.currentVisit = _.first(vm.visits);
    }

    function indicatorClick() {
      if (!vm.currentVisit) return;
      $state.go('sales.visits.outlet.visitCreate', {visitId: vm.currentVisit.id, id: vm.currentVisit.outletId});
    }

  }


})();
