'use strict';

(function () {

  function EditPartnerController(Schema, $state, $window, ConfirmModal) {

    var vm = this;

    _.assign(vm, {

      partner: null,
      legalForm: null,
      legalForms: [],
      name: '',
      inn: '',
      isInCancelProcess: false,
      nameWasChanged: false,
      legalFormWasChanged: false,
      innWasChanged: false,

      partnerDataWasChanged,
      submit,
      cancel,
      cancelConfirm

    });

    var Partner = Schema.model('Partner');
    var LegalForm = Schema.model('LegalForm');

    findPartner();

    function findPartner() {

      vm.busyMessage = 'Загрузка контрагента…';

      vm.busy = Partner.find($state.params.id)
        .then((partner) => {

          vm.partner = partner;
          vm.name = vm.partner.shortName;
          vm.inn = vm.partner.inn;

          return LegalForm.findAll()
            .then((legalForms) => {

              vm.legalForms = _.sortBy(legalForms, (lf) => [lf.ord, _.toLower(lf.name)]);
              vm.legalForm = _.find(legalForms, {id: vm.partner.legalFormId});
              vm.initialLegalForm = vm.legalForm;
              vm.selectedLegalForm = vm.legalForm;

            });

        });

    }

    function partnerDataWasChanged() {

      vm.legalFormWasChanged = vm.initialLegalForm !== vm.selectedLegalForm;

      if (vm.partner) {

        vm.nameWasChanged = vm.partner.shortName !== vm.name;
        vm.innWasChanged = vm.partner.inn !== vm.inn;

      }

      return vm.nameWasChanged || vm.legalFormWasChanged || vm.innWasChanged;

    }

    function saveNewData() {

      if (partnerDataWasChanged()) {

        var legalFormName = vm.initialLegalForm.name;

        if (vm.legalFormWasChanged) {

          vm.partner.legalFormId = vm.selectedLegalForm.id;
          legalFormName = vm.selectedLegalForm.name;

        }

        if (vm.nameWasChanged) {
          vm.partner.name = legalFormName + ' "' + vm.name + '"';
        }

        if (vm.innWasChanged) {
          vm.partner.inn = vm.inn;
        }

        return savePartner();

      }

    }

    function savePartner() {

      vm.busyMessage = 'Сохранение контрагента…';

      vm.busy = Partner.save(vm.partner)
        .then(quit)
        .catch((err) => showSaveErrorAlert(err));

    }

    function showSaveErrorAlert(err) {

      return ConfirmModal.show({
        text: err,
        question: 'Повторить попытку'
      })
        .then(savePartner);

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
      quit();
    }

    function quit() {
      return $state.go('^.partner', {id: vm.partner.id});
    }


  }

  angular.module('webPage')
    .controller('EditPartnerController', EditPartnerController);

})
();
