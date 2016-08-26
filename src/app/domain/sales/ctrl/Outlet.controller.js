'use strict';

(function () {

  function OutletController(Schema, $q, $state, $scope, SalesmanAuth, PhotoHelper, mapsHelper, ConfirmModal, LocationHelper, toastr) {

    // TODO: allow to add/change location for an existing outlet

    var vm = this;

    _.assign(vm, {

      outlet: undefined,
      isUpdateLocationEnabled: true,
      collapsePhotosSection: true,
      collapseVisitsSection: false,
      thumbnails: {},

      visitClick: visit => $state.go('.visit', {visitId: visit.id}),
      mapClick: () => {
        vm.popover = false;
      },

      refresh,
      newVisitClick,
      deleteOutletClick,
      takePhoto,
      outletClick,
      thumbnailClick,
      togglePhotosSection,
      toggleVisitsSection,
      updateLocation

    });

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

    function updateLocation() {

      vm.busyMessage = 'Обновление геопозиции…';

      vm.busy = getLocation(vm.outlet.id)
        .then((data) => {

          vm.updatedLocation = Location.inject(data);
          vm.outlet.locationId = vm.updatedLocation.id;
          vm.busyMessage = null;
          vm.shouldConfirmUpdateLocation = false;
          updateMap(vm.updatedLocation);

        })
        .catch(() => {

          vm.busyMessage = null;
          vm.shouldConfirmUpdateLocation = false

        });

    }

    function getLocation(outletId) {

      return LocationHelper.getLocation(100, outletId, 'Outlet')
        .catch((err) => gotError(err, 'Невозможно получить геопозицию.'));

    }

    function gotError(err, errText) {

      toastr.error(angular.toJson(err), errText);
      throw errText;

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

    function updateMap(location) {

      if (!location) return;

      vm.map.yaCenter = mapsHelper.yLatLng(location);

      vm.startMarker = mapsHelper.yMarkerConfig({
        id: 'outletLocation',
        location: location,
        content: vm.outlet.name,
        hintContent: moment(location.deviceCts + ' Z').format('HH:mm')
      });


    }

    function quit() {
      return $state.go('^');
    }

    function deleteOutletClick() {
      ConfirmModal.show({
        text: 'Действительно удалить запись об этой точке?'
      })
        .then(function () {
          Outlet.destroy(stateFilter)
            .then(quit);
        })
    }

    refresh();

    $scope.$on('$stateChangeSuccess', function (e, to) {
      vm.disableNavs = !!_.get(to, 'data.disableNavs') || to.name === rootState;
    });

  }

  angular.module('webPage')
    .controller('OutletController', OutletController)
  ;

}());
