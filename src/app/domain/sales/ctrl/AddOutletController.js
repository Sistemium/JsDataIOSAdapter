'use strict';

(function () {

  function AddOutletController($state, ConfirmModal, Schema, $window, LocationHelper, $timeout) {

    var vm = this;

    _.assign(vm, {

      selectedPartner: null,
      newOutlet: null,
      partners: [],
      legalForms: [],
      isInCreatingPartnerProcess: false,
      isInCancelProcess: false,
      haveFixedPartner: false,

      submit,
      cancel,
      selectPartner,
      addPartnerBtnClick,
      addPartnerFieldsCheck

    });

    var Partner = Schema.model('Partner');
    var Outlet = Schema.model('Outlet');
    var Location = Schema.model('Location');
    var LegalForm = Schema.model('LegalForm');

    vm.haveFixedPartner = angular.isDefined($state.params.id);

    vm.busyMessage = 'Получение геопозиции…';
    vm.busy = checkLocation();

    function checkLocation() {

      return LocationHelper.getLocation(100, null, 'Outlet')
        .then((data) => {

          vm.busyMessage = 'Загрузка данных…';
          vm.newLocation = Location.inject(data);
          return startController();

        })
        .catch(showGetLocationErrorAlert);

    }

    function startController() {
      return vm.haveFixedPartner ? getFixedPartner() : getPartners();
    }

    function getFixedPartner() {

      return Partner.find($state.params.id)
        .then((partner) => {

          vm.name = partner;
          selectPartner(partner);
          return getLegalForms();

        });

    }

    function getPartners() {

      return Partner.findAll()
        .then((partners) => {

          vm.partners = _.sortBy(partners, (p) => [_.toLower(p.shortName), _.toLower(p.name)]);
          return getLegalForms();

        });

    }

    function getLegalForms() {

      return LegalForm.findAll()
        .then((legalForms) => vm.legalForms = _.sortBy(legalForms, (lf) => [lf.ord, _.toLower(lf.name)]));

    }

    function submit() {

      _.result($window.document, 'activeElement.blur');
      return saveNewData();

    }

    function cancel() {
      cleanUp();
      quit();
    }

    function addPartnerBtnClick(name) {

      vm.isInCreatingPartnerProcess = true;

      var filteredLegalForm = _.find(vm.legalForms, (lf) => _.toLower(name).indexOf(_.toLower(lf.name + ' ')) === 0);

      if (filteredLegalForm) {

        vm.selectedLegalForm = filteredLegalForm;
        vm.legalFormSearch = filteredLegalForm;
        name = name.substr(filteredLegalForm.name.length);

      }

      name = name.replace(/[`'"»«„“\s]+/, '');
      name = _.upperFirst(name);

      vm.name = name;

      $timeout(function() {

        var element = $window.document.getElementById('inputName');
        if (element) element.focus();

      });

    }

    function addPartnerFieldsCheck() {
      return (vm.name && vm.selectedLegalForm && vm.inn && vm.address);
    }

    function saveNewData() {

      var partner = vm.selectedPartner || vm.newPartner || injectPartner(vm.name, vm.inn, vm.selectedLegalForm);
      vm.newOutlet || injectOutlet(partner, vm.address, vm.newLocation);

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

    function injectOutlet(partner, address, location) {

      vm.newOutlet = Outlet.inject({
        address: address,
        name: partner.name,
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

      vm.newOutlet && Outlet.eject(vm.newOutlet) && delete vm.newOutlet;
      vm.newPartner && Partner.eject(vm.newPartner);
      vm.newLocation && Location.eject(vm.newLocation);

    }

    function saveAll() {

      if (vm.newPartner) {

        return Partner.save(vm.newPartner)
          .then(() => Outlet.save(vm.newOutlet))
          .then(() => Location.save(vm.newLocation));

      } else {

        return Outlet.save(vm.newOutlet)
          .then(() => Location.save(vm.newLocation));

      }

    }

    function quit() {
      return vm.newOutlet ? $state.go('sales.territory.outlet', {id: vm.newOutlet.id}) : $state.go('^');
    }

  }

  angular.module('webPage')
    .controller('AddOutletController', AddOutletController);

})
();
