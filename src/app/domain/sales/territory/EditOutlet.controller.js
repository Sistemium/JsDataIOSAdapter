'use strict';

(function () {

  function EditOutletController(Schema, $state, saEtc, $scope, ConfirmModal) {

    var vm = this;

    _.assign(vm, {

      busy: null,

      outlet: null,
      partner: null,
      partners: [],

      selectPartner,
      outletDataWasChanged,
      deleteOutletClick,
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
        .catch(ConfirmModal.showErrorAskRepeat(saveOutlet));

    }

    function submit() {

      saEtc.blurActive();

      if (outletDataWasChanged()) {
        saveOutlet();
      }

    }

    function revertChanges() {
      vm.outlet && Outlet.revert(vm.outlet);
    }

    function cancel() {
      revertChanges();
      quit();
    }

    function quit() {
      return $state.go('^.outlet', {id: vm.outlet.id});
    }

    function deleteOutletClick() {
      ConfirmModal.show({
        text: `Действительно удалить запись о точке ${vm.outlet.name} (${vm.outlet.address})?`
      })
        .then(function () {
          var partnerId = vm.outlet.partnerId;
          Outlet.destroy(vm.outlet.id)
            .then(() => {
              vm.outlet = null;
              $state.go('^.partner', {id: partnerId});
            })
        })
    }

    $scope.$on('$destroy', revertChanges);

  }

  angular.module('webPage')
    .controller('EditOutletController', EditOutletController);

})();
