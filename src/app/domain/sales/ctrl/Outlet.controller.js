'use strict';

(function () {

  function OutletController(Schema, $q, $state, $scope, SalesmanAuth) {

    var vm = this;
    var Outlet = Schema.model('Outlet');
    var Visit = Schema.model('Visit');

    var stateFilter = $state.params.id;
    var salesman = SalesmanAuth.getCurrentUser();

    Outlet.bindOne(stateFilter, $scope, 'vm.outlet');

    Visit.bindAll({
      outletId: stateFilter,
      salesmanId: salesman.id
    }, $scope, 'vm.visits');

    function refresh() {
      vm.busy = $q.all([
        Visit.findAllWithRelations({
          outletId: stateFilter,
          salesmanId: salesman.id
        })(['VisitAnswer','VisitPhoto'])
      ]);
    }

    function newVisitClick() {
      $state.go('.visit');
    }

    angular.extend(vm, {

      refresh: refresh,
      newVisitClick: newVisitClick,
      visitClick: function(visit) {
        $state.go('.visit',{visitId: visit.id});
      }

    });

    refresh();

  }

  angular.module('webPage')
    .controller('OutletController', OutletController)
  ;

}());
