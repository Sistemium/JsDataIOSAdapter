'use strict';

(function () {

  function OutletController(Schema, $q, $state, $scope, SalesmanAuth, mapsHelper, Helpers, $timeout, GalleryHelper) {

    // TODO: allow to add/change location for an existing outlet

    const {PhotoHelper, LocationHelper, toastr, saControllerHelper} = Helpers;
    const {Outlet, Visit, OutletPhoto, Location, OutletSalesmanContract} = Schema.models();

    let vm = saControllerHelper.setup(this, $scope);

    let rootState = _.first($state.current.name.match(/sales\.[^.]+\.[^.]+/)) || 'sales.territory.outlet';
    let stateFilter = $state.params.id;

    vm.use({

      outlet: undefined,
      isUpdateLocationEnabled: true,
      collapsePhotosSection: true,
      collapseVisitsSection: false,
      photos: [],
      isEditable: $state.current.name === 'sales.territory.outlet',

      visitClick: (visit) => $state.go('.visit', {visitId: visit.id}),
      mapClick: () => vm.mapPopoverIsOpen = false,

      refresh,
      newVisitClick,
      editOutletClick,
      takePhoto,
      outletClick,
      thumbClick,
      confirmLocationYesClick,
      confirmLocationNoClick,
      updateLocationClick,
      onStateChange

    });

    GalleryHelper.setupController(vm, $scope);

    SalesmanAuth.watchCurrent($scope, refresh);

    Outlet.bindOne(stateFilter, $scope, 'vm.outlet', () => {

      if (!vm.outlet) return;

      Outlet.loadRelations(vm.outlet, ['photos', 'Location', 'Partner', 'saleOrders', 'Debt'])
        .then(outlet => {

          let outletId = outlet.id;
          let filterByOutletId = {outletId: outletId};

          vm.saleOrderFilter = _.assign({'x-order-by:': '-date'}, filterByOutletId);
          vm.debtFilter = outletId;
          vm.visitFilter = filterByOutletId;

          if (outlet.location) {
            initMap(outlet.location);
          }

          return loadContracts(outlet);

        });

    });

    $timeout(() => {
      vm.mapPopoverIsOpen = $state.params.showLocation === 'true';
      vm.watchScope('vm.mapPopoverIsOpen', () => {
        let showLocation = vm.mapPopoverIsOpen ? true : '';
        $state.go('.', {showLocation}, {notify: false});
      });

    });

    /*
     Functions
     */

    function loadContracts(outlet) {

      return OutletSalesmanContract.findAllWithRelations({outletId: outlet.id}, {bypassCache: true})('Contract')
        .then(data => vm.outletSalesmanContracts = data);
    }

    function onStateChange(to) {

      let isRootState = (to.name === rootState);
      let disableNavs = !!_.get(to, 'data.disableNavs') || isRootState;

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

      vm.rebindAll(OutletPhoto, {
        outletId: stateFilter,
        orderBy: [['deviceTs', 'DESC'], ['ts', 'DESC']]
      }, 'vm.photos', () => {
        let avatar = _.first(vm.photos);
        vm.avatar = avatar;
        vm.avatarSrc = _.get(avatar, 'srcThumbnail');
      });

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
      return PhotoHelper.makePhoto('OutletPhoto', {outletId: vm.outlet.id})
        .then(setAvatar);
    }

    function setAvatar(picture) {
      if (!picture) return console.error('setAvatar with no picture');
      // vm.outlet.avatarPictureId = picture.id;
      // return Outlet.create(vm.outlet);
    }

    function thumbClick() {

      if (!vm.avatar) {
        return takePhoto();
      }

      vm.commentText = `${vm.outlet.partner.shortName} (${vm.outlet.address})`;
      $scope.imagesAll = vm.photos;

      vm.thumbnailClick(vm.avatar);

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
