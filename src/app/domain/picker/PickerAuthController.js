'use strict';

(function () {

  angular.module('webPage')
    .controller('PickerAuthController', PickerAuthController);

  function PickerAuthController($scope, $state, PickerAuth, Schema, toastr) {

    var vm = this;

    var Picker = Schema.model('Picker');

    angular.extend(vm, {

      submit: function () {

        vm.busy = vm.login (vm.code, vm.password);

      },

      login: function (code, password) {
        return Picker.login(code, password)
          .then(function (picker) {

            if (picker) {
              PickerAuth.login (picker);
            } else {
              toastr.error('Неверный код или пароль');
            }

          })
          .catch (function (res){
            toastr.error (_.get(res,'data.text') || 'Ошибка связи');
          })
        ;
      }

    });

  }

})();
