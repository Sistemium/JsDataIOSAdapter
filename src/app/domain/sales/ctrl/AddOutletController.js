'use strict';

(function () {

  function AddOutletController($scope, $state, $q, ConfirmModal, Schema, toastr) {

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

      ConfirmModal.show({
        text: 'Сохранить точку?'
      })
      .then(saveNewData);

    }

    function saveNewData() {

      vm.busy = $q(function (resolve, reject) {

        if (!vm.selectedPartner) {

          var newPartner = Partner.inject({
            name: vm.name
          });

          Partner.save(newPartner)
            .then(function(partner){

              resolve(partner);
              saveOutlet(vm.name, partner)
                .then(function(outlet){

                  resolve(outlet);
                  quit();

                }, function (err) {

                  reject(err);
                  toastr.error(angular.toJson(err), 'Не удалось сохранить точку');

                });

            }, function (err) {

              reject(err);
              toastr.error(angular.toJson(err), 'Не удалось сохранить партнёра');

            });

        } else {

          saveOutlet(vm.name, vm.selectedPartner)
            .then(function(outlet){

              resolve(outlet);
              quit();

            }, function (err) {

              reject(err);
              toastr.error(angular.toJson(err), 'Не удалось сохранить точку');

            });
        }

      }).then(quit);

    }

    function saveOutlet(name, partner) {

      var newOutlet = Outlet.inject({
        address: vm.address,
        name: name,
        partnerId: partner.id
      });

      return Outlet.save(newOutlet);

    }

    function cancel() {

      ConfirmModal.show({
        text: 'Отменить добавление точки?'
      })
        .then(quit)
      ;

    }

    function quit () {
      return $scope['$$destroyed'] || $state.go('^');
    }

    angular.extend(vm, {
      refresh: refresh,
      submit: submit,
      cancel: cancel
    });

    vm.refresh();

  }

  angular.module('webPage')
    .controller('AddOutletController', AddOutletController);

})();
