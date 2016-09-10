'use strict';

(function () {

  function EditPartnerController(Schema, $state, $window, $scope, ConfirmModal) {

    var vm = this;

    _.assign(vm, {

      partner: null,
      legalForms: [],
      isInCancelProcess: false,

      partnerDataWasChanged,
      submit,
      cancel,
      onShortNameChange,
      onLegalFormChange

    });

    var Partner = Schema.model('Partner');
    var LegalForm = Schema.model('LegalForm');

    LegalForm.bindAll({
      orderBy: ['ord', 'name']
    }, $scope, 'vm.legalForms');

    findPartner();

    function findPartner() {

      vm.busyMessage = 'Загрузка контрагента…';

      vm.busy = Partner.find($state.params.id)
        .then((partner) => {
          vm.partner = partner;
          vm.shortName = partner.shortName;
          return LegalForm.findAll()
            .then(() => vm.legalForm = partner.legalForm);
        });

    }

    function onShortNameChange() {
      vm.partner.name = `${_.get(vm.partner,'legalForm.name')} "${vm.shortName}"`;
    }

    function onLegalFormChange(legalForm) {
      vm.partner.legalForm = legalForm;
      onShortNameChange()
    }

    function partnerDataWasChanged() {
      return vm.partner && Partner.hasChanges(vm.partner);
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

      if (partnerDataWasChanged()) {
        savePartner();
      }

    }

    function revertChanges() {
      Partner.revert(vm.partner);
    }

    function cancel() {
      revertChanges();
      quit();
    }

    function quit() {
      return $state.go('^.partner', {id: vm.partner.id});
    }

    $scope.$on('$destroy', revertChanges);

  }

  angular.module('webPage')
    .controller('EditPartnerController', EditPartnerController);

})();
