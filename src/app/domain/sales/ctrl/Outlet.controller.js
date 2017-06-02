'use strict';

(function () {

  function OutletController(Schema, $q, $state, $scope, SalesmanAuth, mapsHelper, Helpers) {

    // TODO: allow to add/change location for an existing outlet

    const {PhotoHelper, LocationHelper, toastr, saControllerHelper} = Helpers;
    const {Outlet, Visit, OutletPhoto, Location} = Schema.models();

    let vm = saControllerHelper.setup(this, $scope);

    let rootState = _.first($state.current.name.match(/sales\.[^.]+\.[^.]+/)) || 'sales.territory.outlet';
    let stateFilter = $state.params.id;

    vm.use({

      outlet: undefined,
      isUpdateLocationEnabled: true,
      collapsePhotosSection: true,
      collapseVisitsSection: false,
      thumbnails: {},
      isEditable: $state.current.name === 'sales.territory.outlet',

      visitClick: (visit) => $state.go('.visit', {visitId: visit.id}),
      mapClick: () => vm.popover = false,

      refresh,
      newVisitClick,
      editOutletClick,
      takePhoto,
      outletClick,
      thumbnailClick,
      togglePhotosSection,
      toggleVisitsSection,
      confirmLocationYesClick,
      confirmLocationNoClick,
      updateLocationClick,
      onStateChange

    });

    SalesmanAuth.watchCurrent($scope, refresh);

    Outlet.bindOne(stateFilter, $scope, 'vm.outlet', function () {

      Outlet.loadRelations(vm.outlet, ['OutletPhoto', 'Location', 'Partner'])
        .then(function (outlet) {
          _.each(outlet.photos, importThumbnail);
          if (outlet.location) {
            initMap(outlet.location);
          }

        });

    });

    /*
     Functions
     */

    function onStateChange (to) {

      var isRootState = (to.name === rootState);
      var disableNavs = !!_.get(to, 'data.disableNavs') || isRootState;

      _.assign(vm, {
        isRootState,
        disableNavs,
        partnerNavClass: {
          disabled: !isRootState && disableNavs || /visits.*/.test(rootState)
        },
        outletNavClass: {
          disabled: disableNavs
        }
      });

    }

    function currentFilter() {
      return SalesmanAuth.makeFilter({
        outletId: stateFilter
      });
    }

    function refresh(salesman) {

      vm.currentSalesman = salesman;

      OutletPhoto.bindAll(currentFilter(), $scope, 'vm.photos');
      Visit.bindAll(currentFilter(), $scope, 'vm.visits');

      vm.busy = $q.all([
        Outlet.find(stateFilter),
        Visit.findAllWithRelations(currentFilter())(['VisitAnswer', 'VisitPhoto'])
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
        .then(() => vm.collapsePhotosSection = false);
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
        .then(() => {
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
        afterMapInit: () => {
          makeOutletMarker();
        }
      };

    }

    function makeOutletMarker() {
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

    function editOutletClick() {
      return $state.go('^.editOutlet', {id: vm.outlet.id});
    }

  }

  angular.module('webPage')
    .controller('OutletController', OutletController);

})();
