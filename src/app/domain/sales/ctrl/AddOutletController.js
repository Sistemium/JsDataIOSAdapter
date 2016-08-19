'use strict';

(function () {

  function AddOutletController($state, $q, $scope, ConfirmModal, Schema, toastr, $window, LocationHelper) {

    var vm = this;
    var Partner = Schema.model('Partner');
    var Outlet = Schema.model('Outlet');
    var Location = Schema.model('Location');
    var LegalForm = Schema.model('LegalForm');

    function addPartnerBtnClick() {

      vm.isInCreatingPartnerProcess = true;
      vm.name = vm.currentSearchValue;

    }

    function getPartners(viewValue, opt) {

      vm.currentSearchValue = viewValue;

      angular.extend(opt, {bypassCache: true});

      return Partner.findAll({
        where: {
          name: {
            likei: viewValue
          }
        }
      }, opt)
        .then(function (partners) {

          vm.partners = _.sortBy(partners, function (p) {
            return p.shortName.toLowerCase();
          });
          return vm.partners;

        });

    }

    function getLegalForms(viewValue, opt) {

      angular.extend(opt, {bypassCache: true});

      return LegalForm.findAll({
        where: {
          name: {
            likei: viewValue
          }
        }
      }, opt)
        .then(function (legalForm) {

          vm.legalForms = _.sortBy(legalForm, function (lf) {
            return lf.name.toLowerCase();
          });
          return vm.legalForms;

        });

    }

    function addPartnerFieldsCheck() {
      return (vm.name && vm.selectedLegalForm && vm.inn && vm.address);
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

    function saveNewData() {

      vm.busyMessage = 'Сохраняем партнёра…';

      vm.busy = savePartner(vm.name, vm.inn, vm.selectedLegalForm)
        .then(function (partner) {

          vm.busyMessage = 'Сохраняем точку…';
          return saveOutlet(vm.name, partner, vm.address);

        })
        .then(function (outlet) {

          vm.busyMessage = 'Получаем геопозицию…';
          return getLocation(outlet);

        })
        .then(function (data) {

          vm.newLocation = Location.inject(data);
          vm.newOutlet.locationId = vm.newLocation.id;
          saveAll();
          return quit();

        })
        .catch(function (err) {

          showSaveErrorAlert(err);
          return $q.reject(err);

        });

    }

    function savePartner(name, inn, legalForm) {

      var havePartner = vm.selectedPartner || vm.newPartner;

      if (havePartner) {
        return $q.resolve(havePartner);
      } else {

        vm.newPartner = Partner.inject({
          name: legalForm.name + ' "' + name + '"',
          inn: inn,
          legalFormId: legalForm.id
        });
        return $q.resolve(vm.newPartner);

      }

    }

    function saveOutlet(name, partner, address) {

      if (!angular.isObject(vm.newOutlet)) {

        vm.newOutlet = Outlet.inject({
          address: address,
          name: name,
          partnerId: partner.id
        });

      }

      return $q.resolve(vm.newOutlet);

    }

    function getLocation(outlet) {

      return LocationHelper.getLocation(100, outlet.id, 'Outlet')
        .catch(function (err) {
          gotError(err, 'Невозможно получить геопозицию.');
        });

    }

    function gotError(err, errText) {

      toastr.error(angular.toJson(err), errText);
      throw errText;

    }

    function showSaveErrorAlert(err) {

      var errText = err + '\n Повторить попытку?';

      ConfirmModal.show({
        text: errText
      })
        .then(saveNewData);

    }

    function selectPartner(partner) {
      partner ? vm.selectedPartner = partner : cleanUp();
    }

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

      if (vm.newPartner) Partner.save(vm.newPartner);
      if (vm.newOutlet) Outlet.save(vm.newOutlet);
      if (vm.newLocation) Location.save(vm.newLocation);

    }

    function quit() {
      return vm.newOutlet ? $state.go('^.outlet', {id: vm.newOutlet.id}) : $state.go('^');
    }

    angular.extend(vm, {
      submit: submit,
      cancel: cancel,
      cancelConfirm: cancelConfirm,
      selectedPartner: null,
      newOutlet: null,
      partners: [],
      currentSearchValue: null,
      isInCreatingPartnerProcess: false,
      isInCancelProcess: false,
      legalForms: [],
      selectPartner: selectPartner,
      getPartners: getPartners,
      addPartnerBtnClick: addPartnerBtnClick,
      getLegalForms: getLegalForms,
      addPartnerFieldsCheck: addPartnerFieldsCheck
    });

  }

  angular.module('webPage')
    .controller('AddOutletController', AddOutletController);

})
();
