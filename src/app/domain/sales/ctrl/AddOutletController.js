'use strict';

(function () {

  function AddOutletController($scope, $state, ConfirmModal, Schema) {

    var vm = this;
    var Partner = Schema.model('Partner');

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
        .then(quit)
      ;

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
