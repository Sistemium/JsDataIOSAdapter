'use strict';

(function () {

  function OutletController(Schema, $window, $q, $state, $scope, SalesmanAuth, IOS, PhotoHelper, mapsHelper) {

    var vm = this;
    var Outlet = Schema.model('Outlet');
    var Visit = Schema.model('Visit');
    var OutletPhoto = Schema.model('OutletPhoto');
    var Location = Schema.model('Location');
    var rootState = 'sales.territory.outlet';

    var stateFilter = $state.params.id;
    var salesman = SalesmanAuth.getCurrentUser();

    vm.thumbnails = {};

    $window.Schema = Schema;

    Outlet.find(stateFilter)
      .then(function (outlet) {
        Location.find(outlet.locationId)
          .then(function (location) {
            initMap(location);
          })
      })

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
        .then(vm.collapsePhotosSection = false);
    }

    function importThumbnail(op) {
      return PhotoHelper.importThumbnail(op, vm.thumbnails);
    }

    function thumbnailClick(pic) {

      var resourceName = 'OutletPhoto';
      var src = vm.thumbnails[pic.id];
      var title = vm.outlet.partner.shortName + ' (' + vm.outlet.address + ')';

      return PhotoHelper.thumbnailClick(resourceName, pic, src, title);

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

      location = location ? location : _.get(vm.outlet, 'location') || _.get(vm, 'outlet.location');

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

    function mapClick() {
      vm.popover = false;
    }

    angular.extend(vm, {

      refresh: refresh,
      newVisitClick: newVisitClick,

      visitClick: function (visit) {
        $state.go('.visit', {visitId: visit.id});
      },

      takePhoto: takePhoto,
      outletClick: outletClick,
      thumbnailClick: thumbnailClick,
      togglePhotosSection: togglePhotosSection,
      collapsePhotosSection: true,
      toggleVisitsSection: toggleVisitsSection,
      collapseVisitsSection: false,
      mapClick: mapClick

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
