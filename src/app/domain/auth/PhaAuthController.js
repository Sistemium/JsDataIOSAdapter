'use strict';

(function () {

  angular.module('core.services')
    .controller('PhaAuthController', PhaAuthController);

  function PhaAuthController (phaService,$state,toastr) {
    var vm = this;

    function submit () {
      if (vm.state === 'mobileNumber') {
        vm.busy = phaService.auth('8'+vm.mobileNumber)
          .then(function (){
            vm.state = 'code';
          })
          .catch(function(){
            toastr.error('Неправильный номер');
          })
        ;
      } else if (vm.state === 'code') {
        vm.busy = phaService.confirm(vm.code)
          .then(function (){
            $state.go('home');
          })
          .catch(function(){
            toastr.error('Неправильный код');
          })
        ;
      }
    }

    angular.extend (vm,{

      state: 'mobileNumber',
      mobileNumber: '',
      code: '',

      mobileNumberMask: '8 (999) 999-99-99',
      submit: submit

    });

  }

})();
