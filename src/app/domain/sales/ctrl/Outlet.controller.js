'use strict';

(function () {

  function OutletController(Schema, $window, $q, $state, $scope, SalesmanAuth, IOS, PhotoHelper, mapsHelper) {

    // TODO: allow to add/change location for an existing outlet

    var vm = this;
    var Outlet = Schema.model('Outlet');
    var Visit = Schema.model('Visit');
    var OutletPhoto = Schema.model('OutletPhoto');
    var Location = Schema.model('Location');
    var rootState = 'sales.territory.outlet';

    var stateFilter = $state.params.id;
    var salesman = SalesmanAuth.getCurrentUser();

    Outlet.bindOne(stateFilter, $scope, 'vm.outlet', function () {

      Outlet.loadRelations(vm.outlet, 'OutletPhoto')
        .then(function (outlet) {
          _.each(outlet.photos, importThumbnail);
        });

    });

    OutletPhoto.bindAll({
      outletId: stateFilter
    }, $scope, 'vm.photos');

    Visit.bindAll({
      outletId: stateFilter,
      salesmanId: salesman.id
    }, $scope, 'vm.visits');

    function refresh() {
      vm.busy = $q.all([
        Outlet.find(stateFilter)
          .then(function (outlet) {
            Location.find(outlet.locationId)
              .then(initMap)
          }),
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
      return PhotoHelper.takePhoto('OutletPhoto', {outletId: vm.outlet.id}, vm.thumbnails)
        .then(()=> vm.collapsePhotosSection = false);
    }

    function importThumbnail(op) {
      return PhotoHelper.importThumbnail(op, vm.thumbnails);
    }

    function thumbnailClick(pic) {

      var src = vm.thumbnails[pic.id];
      var title = vm.outlet.partner.shortName + ' (' + vm.outlet.address + ')';

      return PhotoHelper.thumbnailClick('OutletPhoto', pic, src, title);

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

    function initMap(location) {

      if (!location) {
        return;
      }

      vm.map = {
        yaCenter: mapsHelper.yLatLng(location),
        afterMapInit: function () {

          vm.startMarker = mapsHelper.yMarkerConfig({
            id: 'outletLocation',
            location: location,
            content: vm.outlet.name,
            hintContent: moment(location.deviceCts + ' Z').format('HH:mm')
          });

        }
      };

    }

    _.assign(vm, {

      collapsePhotosSection: true,
      collapseVisitsSection: false,
      thumbnails: {},

      visitClick: visit => $state.go('.visit', {visitId: visit.id}),
      mapClick: () => vm.popover = false,

      refresh,
      newVisitClick,
      takePhoto,
      outletClick,
      thumbnailClick,
      togglePhotosSection,
      toggleVisitsSection

    });

    refresh();

    $scope.$on('$stateChangeSuccess', function (e, to) {
      vm.disableNavs = !!_.get(to, 'data.disableNavs') || to.name === rootState;
    });

  }

  angular.module('webPage')
    .controller('OutletController', OutletController)
  ;

}());
