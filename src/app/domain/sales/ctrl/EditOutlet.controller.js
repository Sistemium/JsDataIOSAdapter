'use strict';

(function () {

  function EditOutletController(Schema, $state, $window, ConfirmModal/*, $scope*/) {

    var vm = this;

    _.assign(vm, {

      busy: null,

      outlet: null,
      partner: null,
      partners: [],
      initialPartner: null,
      selectedPartner: null,
      isInCancelProcess: false,
      partnerWasChanged: false,
      addressWasChanged: false,

      address: '',

      selectPartner,
      outletDataWasChanged,
      submit,
      cancel,
      cancelConfirm

    });

    var Outlet = Schema.model('Outlet');
    var Partner = Schema.model('Partner');

    findOutlet();

    //$scope.$watch('vm.partner', (newValue) => {
    //  console.log('vm.partner', newValue);
    //});
    //
    //$scope.$watch('vm.selectedPartner', (newValue) => {
    //  console.log('vm.selectedPartner', newValue);
    //});

    function findOutlet() {

      vm.busyMessage = 'Загрузка точки…';

      vm.busy = Outlet.find($state.params.id)
        .then((outlet) => {

          vm.outlet = outlet;
          vm.address = outlet.address;

          return Partner.findAll()
            .then((partners) => {

              vm.partners = _.sortBy(partners, (p) => [_.toLower(p.shortName), _.toLower(p.name)]);
              vm.partner = _.find(partners, {id: outlet.partnerId});
              vm.initialPartner = vm.partner;
              vm.selectedPartner = vm.partner;

            });

        });

    }

    function selectPartner(partner) {
      vm.selectedPartner = partner;
    }

    function outletDataWasChanged() {

      vm.partnerWasChanged = vm.initialPartner !== vm.selectedPartner;
      vm.addressWasChanged = vm.outlet && vm.outlet.address !== vm.address;

      return vm.partnerWasChanged || vm.addressWasChanged;

    }

    function saveNewData() {

      if (outletDataWasChanged()) {

        if (vm.partnerWasChanged) {
          vm.outlet.partnerId = vm.selectedPartner.id;
        }

        if (vm.addressWasChanged) {
          vm.outlet.address = vm.address;
        }

        return saveOutlet();

      }

    }

    function saveOutlet() {

      vm.busyMessage = 'Сохранение точки…';

      vm.busy = Outlet.save(vm.outlet)
        .then(quit)
        .catch((err) => showSaveErrorAlert(err));

    }

    function showSaveErrorAlert(err) {

      return ConfirmModal.show({
        text: err,
        question: 'Повторить попытку'
      })
        .then(saveOutlet);

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
      return $state.go('^');
    }

  }

  angular.module('webPage')
    .controller('EditOutletController', EditOutletController);

})
();
