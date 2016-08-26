'use strict';

(function () {

  function AddOutletController($state, $q, ConfirmModal, Schema, $window, LocationHelper) {

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
      addPartnerFieldsCheck

    });

    var Partner = Schema.model('Partner');
    var Outlet = Schema.model('Outlet');
    var Location = Schema.model('Location');
    var LegalForm = Schema.model('LegalForm');

    checkLocation();

    function checkLocation() {

      vm.busyMessage = 'Получение геопозиции…';

      vm.busy = LocationHelper.getLocation(100, null, 'Outlet')
        .then((data) => {

          vm.busyMessage = 'Загрузка данных…';
          vm.newLocation = Location.inject(data);
          return startController();

        })
        .catch(showGetLocationErrorAlert);

    }

    function startController() {

      return Partner.findAll()
        .then(function (partners) {
          vm.partners = _.sortBy(partners, (p) => [_.lowerCase(p.shortName), _.lowerCase(p.name)]);
          LegalForm.findAll()
            .then(function (legalForms) {
              vm.legalForms = _.sortBy(legalForms, (lf) => [lf.ord, _.lowerCase(lf.name)]);
            });
        });

    }

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

    function addPartnerBtnClick(name) {

      vm.isInCreatingPartnerProcess = true;
      vm.name = name;

    }

    function addPartnerFieldsCheck() {
      return (vm.name && vm.selectedLegalForm && vm.inn && vm.address);
    }

    function saveNewData() {

      var partner = vm.selectedPartner || vm.newPartner || injectPartner(vm.name, vm.inn, vm.selectedLegalForm);
      vm.newOutlet || injectOutlet(vm.name, partner, vm.address, vm.newLocation);

      vm.busyMessage = 'Создание точки…';

      vm.busy = saveAll()
        .then(quit)
        .catch(function (err) {
          showSaveErrorAlert(err);
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

    function injectOutlet(name, partner, address, location) {

      vm.newOutlet = Outlet.inject({
        address: address,
        name: name,
        partnerId: partner.id,
        locationId: location.id,
        source: 'user'
      });

      location.ownerXid = vm.newOutlet.id;

      return vm.newOutlet;

    }

    function showGetLocationErrorAlert(err) {

      return ConfirmModal.show({
        text: err,
        question: 'Повторить попытку'
      })
        .then(checkLocation)
        .catch(quit);

    }

    function showSaveErrorAlert(err) {

      return ConfirmModal.show({
        text: err,
        question: 'Повторить попытку'
      })
        .then(saveNewData);

    }

    function selectPartner(partner) {

      vm.selectedPartner = partner;

    }

    function cleanUp() {
      vm.newOutlet && Outlet.eject(vm.newOutlet);
      vm.newPartner && Partner.eject(vm.newPartner);
      vm.newLocation && Location.eject(vm.newLocation);
    }

    function saveAll() {

      if (vm.newPartner) {

        return Partner.save(vm.newPartner)
          .then(()=>Outlet.save(vm.newOutlet))
          .then(()=>Location.save(vm.newLocation));

      } else {

        return Outlet.save(vm.newOutlet)
          .then(()=>Location.save(vm.newLocation));

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
