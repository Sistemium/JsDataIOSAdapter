'use strict';

(function () {

  function AddOutletController($state, $q, ConfirmModal, Schema, toastr, $window, LocationHelper) {

    var vm = this;
    var Partner = Schema.model('Partner');
    var Outlet = Schema.model('Outlet');

    function refresh() {

      Partner.findAll()
        .then(function (res) {
          vm.partners = res;
        });

    }

    function submit() {

      _.result($window.document, 'activeElement.blur');

      ConfirmModal.show({
        text: 'Сохранить точку?'
      })
        .then(saveNewData);

    }

    function saveNewData() {

      vm.busy = $q(function (resolve, reject) {

        if (!vm.selectedPartner) {

          var newPartner = Partner.createInstance({
            name: vm.name
          });

          Partner.create(newPartner)
            .then(function (partner) {

              saveOutlet(vm.name, partner)
                .then(resolve, reject);

            }, function (err) {

              reject(err);
              toastr.error(angular.toJson(err), 'Не удалось сохранить партнёра');

            });

        } else {

          saveOutlet(vm.name, vm.selectedPartner)
            .then(resolve, reject);

        }

      }).then(quit);

    }

    function saveOutlet(name, partner) {

      var newOutlet = Outlet.createInstance({
        address: vm.address,
        name: name,
        partnerId: partner.id
      });

      return Outlet.create(newOutlet)
        .then(function() {
          vm.newOutletId = newOutlet.id;
        })
        .catch(function (err) {
          toastr.error(angular.toJson(err), 'Не удалось сохранить точку');
        });

    }

    function getLocation(outlet) {

      return LocationHelper.getLocation(100, outlet.id, 'Outlet')
        .catch(function (err) {

          toastr.error(angular.toJson(err), 'Невозможно получить геопозицию.');

          ConfirmModal.show({
            text: 'Невозможно получить геопозицию. Повторить попытку?'
          })
            .then(function () {
              Outlet.destroy(outlet.id);
              if (!vm.selectedPartner) Partner.destroy(outlet.partnerId);
              vm.newOutletId = null;
              saveNewData();
            });

        });

    }

    function cancel(form) {

      if (form.$pristine) {
        return quit();
      }

      ConfirmModal.show({
        text: 'Отменить добавление точки?'
      })
        .then(quit);

    }

    function quit() {
      return vm.newOutletId ? $state.go('^.outlet', {id: vm.newOutletId}) : $state.go('^');
    }

    angular.extend(vm, {
      selectedPartner: null,
      newOutletId: null,
      refresh: refresh,
      submit: submit,
      cancel: cancel
    });

    vm.refresh();

  }

  angular.module('webPage')
    .controller('AddOutletController', AddOutletController);

})();
