'use strict';

(function () {

  function EditOutletController(Schema, $state, $window, $scope, ConfirmModal) {

    var vm = this;

    _.assign(vm, {

      busy: null,

      outlet: null,
      partner: null,
      partners: [],

      selectPartner,
      outletDataWasChanged,
      submit,
      cancel

    });

    var Outlet = Schema.model('Outlet');
    var Partner = Schema.model('Partner');

    findOutlet();

    Partner.bindAll({
      orderBy: ['shortName', 'name']
    }, $scope, 'vm.partners');

    function findOutlet() {

      vm.busyMessage = 'Загрузка точки…';

      vm.busy = Outlet.find($state.params.id)
        .then((outlet) => {
          vm.outlet = outlet;
          return Partner.findAll()
            .then(() => vm.partner = outlet.partner);
        });

    }

    function selectPartner(partner) {
      vm.outlet.partner = partner;
    }

    function outletDataWasChanged() {
      return vm.outlet && Outlet.hasChanges(vm.outlet);
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

      if (outletDataWasChanged()) {
        saveOutlet();
      }

    }

    function revertChanges() {
      Outlet.revert(vm.outlet);
    }

    function cancel() {
      revertChanges();
      quit();
    }

    function quit() {
      return $state.go('^.outlet', {id: vm.outlet.id});
    }

    $scope.$on('$destroy', revertChanges);

  }

  angular.module('webPage')
    .controller('EditOutletController', EditOutletController);

})();
