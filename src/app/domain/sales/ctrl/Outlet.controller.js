'use strict';

(function () {

  function OutletController(Schema, $q, $state, $scope, SalesmanAuth, IOS) {

    var vm = this;
    var Outlet = Schema.model('Outlet');
    var Visit = Schema.model('Visit');
    var rootState = 'sales.territory.outlet';

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
        })(['VisitAnswer', 'VisitPhoto'])
      ]);
    }

    function outletClick() {
      if ($state.current.name === rootState) {
        // return;
      } else {
        $state.go('^', {id: $state.params.id});
      }
    }

    function takePhoto() {
      var q = IOS.takePhoto('OutletPhoto', {
        outletId: vm.outlet.id
      });

      q.then(function (res) {

        console.log(res);
        //importThumbnail(VisitPhoto.inject(res));

      }).catch(function (res) {
        vm.photo = false;
        vm.error = res;
      })
    }

    function togglePhotosSection() {
      vm.collapsePhotosSection = !vm.collapsePhotosSection;
    }

    function toggleVisitsSection() {
      vm.collapseVisitsSection = !vm.collapseVisitsSection;
    }

    function newVisitClick() {
      $state.go('.visitCreate');
    }

    angular.extend(vm, {

      refresh: refresh,
      newVisitClick: newVisitClick,

      visitClick: function (visit) {
        $state.go('.visit', {visitId: visit.id});
      },

      takePhoto: takePhoto,
      outletClick: outletClick,
      togglePhotosSection: togglePhotosSection,
      collapsePhotosSection: true,
      toggleVisitsSection: toggleVisitsSection,
      collapseVisitsSection: false

    });

    refresh();

    $scope.$on('$stateChangeSuccess', function (e, to) {
      vm.disableNavs = !!_.get(to,'data.disableNavs') || to.name === rootState;
    });

  }

  angular.module('webPage')
    .controller('OutletController', OutletController)
  ;

}());
