'use strict';

(function () {

  function AddOutletController($state, $q, $scope, ConfirmModal, Schema, toastr, $window, LocationHelper) {

    var vm = this;

    _.assign(vm, {

      currentSearchValue: undefined,
      selectedPartner: null,
      newOutlet: null,
      partners: [],
      legalForms: [],
      isInCreatingPartnerProcess: false,
      isInCancelProcess: false,

      submit,
      cancel,
      cancelConfirm,
      selectPartner,
      addPartnerBtnClick,
      addPartnerFieldsCheck,
      inputNameFocus,
      inputNameBlur

    });

    var Partner = Schema.model('Partner');
    var Outlet = Schema.model('Outlet');
    var Location = Schema.model('Location');
    var LegalForm = Schema.model('LegalForm');

    Partner.findAll()
      .then(function (partners) {
        vm.partners = _.sortBy(partners, (p) => [p.shortName.toLowerCase(), p.name.toLowerCase()]);
      });

    LegalForm.findAll()
    .then(function (legalForms) {
        vm.legalForms = _.sortBy(legalForms, (lf) => [lf.ord, lf.name.toLowerCase()]);
      });

    function submit() {

      _.result($window.document, 'activeElement.blur');
      return saveNewData();

    }

    function cancel(form) {

      if (form.$pristine) {
        quit();
      } else {
        vm.isInCancelProcess = true;
      }

    }

    function cancelConfirm() {
      cleanUp();
      quit();
    }

    function addPartnerBtnClick() {

      vm.name = vm.currentSearchValue;
      vm.isInCreatingPartnerProcess = true;
      vm.selectedPartner = null;

    }

    function addPartnerFieldsCheck() {
      return (vm.name && vm.selectedLegalForm && vm.inn && vm.address);
    }

    function saveNewData() {

      var partner = vm.selectedPartner || vm.newPartner || injectPartner(vm.name, vm.inn, vm.selectedLegalForm);
      var outlet = vm.newOutlet || injectOutlet(vm.name, partner, vm.address);

      vm.busyMessage = 'Получение геопозиции…';

      vm.busy = getLocation(outlet)
        .then(function (data) {

          vm.newLocation = Location.inject(data);
          vm.newOutlet.locationId = vm.newLocation.id;

        })
        .then(saveAll)
        .then(quit)
        .catch(function (err) {

          vm.busyMessage = null;
          showSaveErrorAlert(err);
          return $q.reject(err);

        });

    }

    function injectPartner(name, inn, legalForm) {

      vm.newPartner = Partner.inject({
        name: legalForm.name + ' "' + name + '"',
        inn: inn,
        legalFormId: legalForm.id,
        source: 'user'
      });
      return vm.newPartner;

    }

    function injectOutlet(name, partner, address) {

      vm.newOutlet = Outlet.inject({
        address: address,
        name: name,
        partnerId: partner.id,
        source: 'user'
      });

      return vm.newOutlet;

    }

    function getLocation(outlet) {

      return LocationHelper.getLocation(100, outlet.id, 'Outlet')
        .catch((err) => gotError(err, 'Невозможно получить геопозицию.'));

    }

    function gotError(err, errText) {

      toastr.error(angular.toJson(err), errText);
      throw errText;

    }

    function showSaveErrorAlert(err) {

      return ConfirmModal.show({
        text: err,
        question: 'Повторить попытку'
      })
        .then(saveNewData);

    }

    function inputNameFocus() {

      if (!angular.isUndefined(vm.currentSearchValue)) {
        vm.name = vm.currentSearchValue;
      }

    }

    function inputNameBlur() {

      if (vm.selectedPartner) {
        vm.name = vm.selectedPartner;
      }

    }

    function selectPartner(partner) {

      if (angular.isUndefined(vm.currentSearchValue)) vm.currentSearchValue = '';
      partner ? vm.selectedPartner = partner : cleanUp();

    }

    $scope.$watch('vm.name', function (newValue) {
      if (!angular.isObject(newValue)) vm.currentSearchValue = newValue;
    });

    function cleanUp() {

      delete vm.selectedPartner;

      if (vm.newOutlet) {

        Outlet.eject(vm.newOutlet);
        delete vm.newOutlet;

      }

      if (vm.newPartner) {

        Partner.eject(vm.newPartner);
        delete vm.newPartner;

      }

      if (vm.newLocation) {

        Location.eject(vm.newLocation);
        delete vm.newLocation;

      }

    }

    function saveAll() {

      if (vm.newPartner) {

        return Partner.save(vm.newPartner)
          .then(Outlet.save(vm.newOutlet))
          .then(Location.save(vm.newLocation));

      } else {

        return Outlet.save(vm.newOutlet)
          .then(Location.save(vm.newLocation));

      }

    }

    function quit() {
      return vm.newOutlet ? $state.go('^.outlet', {id: vm.newOutlet.id}) : $state.go('^');
    }

  }

  angular.module('webPage')
    .controller('AddOutletController', AddOutletController);

})
();
