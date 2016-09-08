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

      visitClick: (visit) => $state.go('.visit', {visitId: visit.id}),
      mapClick: () => vm.popover = false,

      refresh,
      newVisitClick,
      deleteOutletClick,
      editOutletClick,
      takePhoto,
      outletClick,
      thumbnailClick,
      togglePhotosSection,
      toggleVisitsSection,
      confirmLocationYesClick,
      confirmLocationNoClick,
      updateLocationClick

    });

    var Outlet = Schema.model('Outlet');
    var Visit = Schema.model('Visit');
    var OutletPhoto = Schema.model('OutletPhoto');
    var Location = Schema.model('Location');
    var rootState = 'sales.territory.outlet';

    var stateFilter = $state.params.id;
    var salesman = SalesmanAuth.getCurrentUser();

    Outlet.bindOne(stateFilter, $scope, 'vm.outlet', function () {

      Outlet.loadRelations(vm.outlet, ['OutletPhoto', 'Location'])
        .then(function (outlet) {
          _.each(outlet.photos, importThumbnail);
          if (outlet.location) {
            initMap(outlet.location);
          }

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
        Outlet.find(stateFilter),
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

    function updateLocationClick($event) {

      $event.preventDefault();

      vm.busyMessage = 'Поиск геопозиции…';

      vm.busy = getLocation(vm.outlet.id)
        .then((data) => {

          vm.updatedLocation = Location.inject(data);
          vm.shouldConfirmUpdateLocation = true;
          updateMap(vm.updatedLocation);

        });

    }

    function confirmLocationYesClick($event) {
      $event.preventDefault();
      vm.outlet.location = vm.updatedLocation;
      vm.busyMessage = 'Сохранение геопозиции…';
      vm.busy = Outlet.save(vm.outlet)
        .then(()=>{
          vm.shouldConfirmUpdateLocation = false;
          vm.markers = false;
          makeOutletMarker();
        })
        .catch(err => gotError(err, 'Не удалось сохранить данные'));
    }

    function confirmLocationNoClick($event) {
      $event.preventDefault();
      vm.shouldConfirmUpdateLocation = false;
      vm.markers = false;
      vm.map.yaCenter = mapsHelper.yLatLng(vm.outlet.location);
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
        afterMapInit: ()=>{
          makeOutletMarker();
        }
      };

    }

    function makeOutletMarker () {
      vm.startMarker = mapsHelper.yMarkerConfig({
        id: 'outletLocation',
        location: vm.outlet.location,
        content: vm.outlet.name,
        hintContent: moment(vm.outlet.location.timestamp + ' Z').format('HH:mm')
      });
    }

    function updateMap(location) {

      if (!location) return;

      vm.map.yaCenter = mapsHelper.yLatLng(location);

      vm.markers = [mapsHelper.yMarkerConfig({
        id: 'updatedLocation',
        location: location,
        content: 'Новая геопозиция',
        hintContent: moment(location.deviceCts + ' Z').format('HH:mm')
      })];

    }

    function quit() {
      return $state.go('^');
    }

    function deleteOutletClick() {
      ConfirmModal.show({
        text: `Действительно удалить запись о точке ${vm.outlet.name} (${vm.outlet.address})?`
      })
        .then(function () {
          Outlet.destroy(stateFilter)
            .then(quit);
        })
    }

    function editOutletClick() {
      return $state.go('^.editOutlet', {id: vm.outlet.id});
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
