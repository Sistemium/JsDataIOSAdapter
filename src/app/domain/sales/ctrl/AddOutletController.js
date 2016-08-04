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

        savePartner(vm.name)
          .then(function (partner) {
            return saveOutlet(vm.name, partner, vm.address);
          })
          .then(function (outlet) {
            return getLocation(outlet);
          })
          .then(function (data) {
            resolve(data);
          })
          .catch(function (err) {
            reject(err);
          });

      });

    }

    function savePartner(name) {

      var havePartner = vm.selectedPartner || vm.newPartner;

      if (havePartner) {
        return $q.resolve(havePartner);
      } else {

        var newPartner = Partner.createInstance({
          name: name
        });

        return Partner.create(newPartner)
          .then(function (newPartner) {

            vm.newPartner = newPartner;
            return newPartner;

          }, function (err) {

            toastr.error(angular.toJson(err), 'Не удалось сохранить партнёра');
            throw err;

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

          }, function (err) {

            toastr.error(angular.toJson(err), 'Не удалось сохранить точку');
            throw err;

          });

      }

    }

    function getLocation(outlet) {

      return LocationHelper.getLocation(100, outlet.id, 'Outlet')
        .catch(function (err) {
          toastr.error(angular.toJson(err), 'Невозможно получить геопозицию.');
          throw err;
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
      return vm.newOutlet ? $state.go('^.outlet', {id: vm.newOutlet.id}) : $state.go('^');
    }

    angular.extend(vm, {
      selectedPartner: null,
      newOutlet: null,
      refresh: refresh,
      submit: submit,
      cancel: cancel
    });

    vm.refresh();

  }

  angular.module('webPage')
    .controller('AddOutletController', AddOutletController);

})();
