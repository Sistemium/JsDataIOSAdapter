'use strict';

(function () {

  function AddOutletController($scope, $state, ConfirmModal) {

    var vm = this;

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
      submit: submit,
      cancel: cancel
    });

  }

  angular.module('webPage')
    .controller('AddOutletController', AddOutletController);

})();
