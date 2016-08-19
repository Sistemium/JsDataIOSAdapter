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

      console.log('submit: should ask for confirm?');
      return saveNewData();

    }

    function cancel(form) {

      if (form.$pristine) {
        console.log('cancel w/o confirmation');
        quit();
      } else {
        console.log('cancel: should ask for confirm?');
        cleanUp();
        quit();
      }

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

          var location = Location.inject(data);
          vm.newOutlet.locationId = location.id;

          return quit(vm.newOutlet);

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

        var newPartner = Partner.createInstance({
          name: legalForm.name + ' "' + name + '"',
          inn: inn,
          legalFormId: legalForm.id
        });

        return Partner.create(newPartner)
          .then(function (newPartner) {

            vm.newPartner = newPartner;
            return newPartner;

          })
          .catch(function (err) {
            gotError(err, 'Не удалось сохранить партнёра.');
          });

      }

    }

    function saveOutlet(name, partner, address) {

      if (vm.newOutlet) {
        return $q.resolve(vm.newOutlet);
      } else {

        var newOutlet = Outlet.createInstance({
          address: address,
          name: name,
          partnerId: partner.id
        });

        return Outlet.create(newOutlet)
          .then(function (newOutlet) {

            vm.newOutlet = newOutlet;
            return newOutlet;

          })
          .catch(function (err) {
            gotError(err, 'Не удалось сохранить точку.');
          });

      }

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

        Outlet.destroy(vm.newOutlet);
        vm.newOutlet = null;

      }

      if (vm.newPartner) {

        Partner.destroy(vm.newPartner);
        vm.newPartner = null;

      }

    }

    function quit(outlet) {
      return outlet ? $state.go('^.outlet', {id: outlet.id}) : $state.go('^');
    }

    angular.extend(vm, {
      submit: submit,
      cancel: cancel,
      selectedPartner: null,
      newOutlet: null,
      partners: [],
      currentSearchValue: null,
      isInCreatingPartnerProcess: false,
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
