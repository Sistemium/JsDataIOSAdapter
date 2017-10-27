'use strict';

(function () {

  function AddOutletController($state, ConfirmModal, Schema, saEtc, LocationHelper, saControllerHelper, $scope) {

    const LOCATION_ACCURACY = 100;

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      selectedPartner: null,
      newOutlet: null,
      partners: [],
      legalForms: [],
      isInCreatingPartnerProcess: false,
      fixedPartner: !!$state.params.id,

      submit,
      cancel,
      selectPartner,
      addPartnerBtnClick,
      addPartnerFieldsCheck

    });

    const {Partner, Outlet, Location, LegalForm} = Schema.models();

    vm.setBusy(checkLocation(), 'Получение геопозиции');

    function checkLocation() {

      return LocationHelper.getLocation(LOCATION_ACCURACY, null, 'Outlet')
        .then(data => {

          vm.busyMessage = 'Загрузка данных';
          vm.newLocation = Location.inject(data);

          if (vm.fixedPartner) {
            return getFixedPartner();
          } else {
            return getPartners();
          }

        })
        .catch(ConfirmModal.showErrorAskRepeat(checkLocation, quit));

    }


    function getFixedPartner() {

      return Partner.find($state.params.id)
        .then(partner => {

          vm.name = partner;
          selectPartner(partner);
          return getLegalForms();

        });

    }

    function getPartners() {

      return Partner.findAll({}, {cacheResponse: false})
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

      saEtc.blurActive();
      return saveNewData();

    }

    function cancel() {
      cleanUp();
      quit();
    }

    function addPartnerBtnClick(name) {

      vm.isInCreatingPartnerProcess = true;

      let filteredLegalForm = _.find(vm.legalForms, (lf) => _.toLower(name).indexOf(_.toLower(lf.name + ' ')) === 0);

      if (filteredLegalForm) {

        vm.selectedLegalForm = filteredLegalForm;
        vm.legalFormSearch = filteredLegalForm;
        name = name.substr(filteredLegalForm.name.length);

      }

      name = name.replace(/[`'"»«„“\s]+/, '');
      name = _.upperFirst(name);

      vm.name = name;

      saEtc.focusElementById('inputName');

    }

    function addPartnerFieldsCheck() {
      return vm.name && vm.selectedLegalForm && vm.inn && vm.address;
    }

    function saveNewData() {

      let partner = vm.selectedPartner || vm.newPartner || injectPartner(vm.name, vm.inn, vm.selectedLegalForm);
      vm.newOutlet || injectOutlet(partner, vm.address, vm.newLocation);

      vm.busyMessage = 'Создание точки';

      vm.busy = saveAll()
        .then(quit)
        .catch(ConfirmModal.showErrorAskRepeat(saveNewData));

    }

    function injectPartner(name, inn, legalForm) {

      vm.newPartner = Partner.inject({
        name: `${legalForm.name} "${name}"`,
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
