'use strict';

(function () {

  angular.module('core.services')
    .controller('PhaAuthController', PhaAuthController);

  function PhaAuthController(phaService, $state, toastr) {

    const vm = this;

    let accessToken = $state.params['access-token'];

    _.assign(vm, {

      state: 'mobileNumber',
      mobileNumber: '',
      code: '',

      mobileNumberMask: '8 (999) 999-99-99',
      submit: submit

    });

    if (accessToken) {
      vm.busy = phaService.getRoles(accessToken)
        .then(() => {
          $state.go('home');
        })
        .catch(err => console.warn(err));
    }

    /*
    Functions
     */

    function submit() {

      if (vm.state === 'mobileNumber') {

        vm.busy = phaService.auth('8' + vm.mobileNumber)
          .then(() => {
            vm.state = 'code';
          })
          .catch(() => {
            toastr.error('Неправильный номер');
          });

      } else if (vm.state === 'code') {

        vm.busy = phaService.confirm(vm.code)
          .then(() => {
            $state.go('home');
          })
          .catch(() => {
            toastr.error('Неправильный код');
          });
      }

    }

  }

})();
