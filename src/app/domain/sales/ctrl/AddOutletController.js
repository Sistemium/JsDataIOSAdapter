'use strict';

(function () {

  function AddOutletController($state, $q, $scope, ConfirmModal, Schema, toastr, $window, LocationHelper, SalesmanAuth) {

    var vm = this;
    var Partner = Schema.model('Partner');
    var Outlet = Schema.model('Outlet');
    var Location = Schema.model('Location');

    function refresh() {

      Partner.findAll(false, {bypassCache: true})
        .then(function (res) {
          vm.partners = res;
        });

    }

    function submit() {

      _.result($window.document, 'activeElement.blur');

      ConfirmModal.show({
        text: 'Сохранить точку?'
      })
        .then(checkOutletName)
        .then(checkOutletAddress)
        .then(saveNewData)
        .catch();

    }

    function saveNewData() {

      vm.busyMessage = 'Сохраняем партнёра…';

      vm.busy = savePartner(vm.name)
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

          quit();

        })
        .catch(function (err) {

          showSaveErrorAlert(err);
          return $q.reject(err);

        });

    }

    function checkOutletName() {

      if (vm.selectedPartner) return vm.selectedPartner;

      var filteredPartner = _.find(vm.partners, {name: vm.name});

      if (filteredPartner) {

        return ConfirmModal.show({
          text: 'Партнёр "' + filteredPartner.name + '" уже существует. Использовать существующего партнёра?'
        })
          .then(function () {

            vm.selectedPartner = filteredPartner;
            return filteredPartner;

          });

      }

    }

    function checkOutletAddress(partner) {

      if (!partner) return;

      var filterParams = {
        partnerId: partner.id,
        address: vm.address
      };

      //vm.salesman = SalesmanAuth.getCurrentUser();
      //
      //if (vm.salesman) {
      //  filterParams.salesmanId = vm.salesman.id;
      //}

      return Outlet.findAll(filterParams, {bypassCache: true})
        .then(function (outlets) {

          var filteredOutlet = outlets[0];

          if (filteredOutlet) {

            return ConfirmModal.show({
              text: 'Точка "' + filteredOutlet.name + '" с адресом ' + filteredOutlet.address + ' уже существует. Использовать существующую точку?'
            })
              .then(function () {

                $state.go('^.outlet', {id: filteredOutlet.id});
                return $q.reject();

              }, $q.reject);

          }

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

    function cancel(form) {

      if (form.$pristine) {
        return quit();
      }

      ConfirmModal.show({
        text: 'Отменить добавление точки?'
      })
        .then(function () {

          cleanUp();
          quit();

        });

    }

    function cleanUp() {

      if (vm.newOutlet) {

        Outlet.destroy(vm.newOutlet);
        vm.newOutlet = null;

      }

      if (vm.newPartner) {

        Partner.destroy(vm.newPartner);
        vm.newPartner = null;

      }

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

    $scope.$watch('vm.name', function (newValue, oldValue) {
      console.log('name changed from ' + oldValue + ' to ' + newValue);
    })

  }

  angular.module('webPage')
    .controller('AddOutletController', AddOutletController);

})();
