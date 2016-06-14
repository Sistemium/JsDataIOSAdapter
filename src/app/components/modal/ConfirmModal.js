'use strict';

(function() {

  function ConfirmModal ($uibModal) {

    function show(config) {

      var modalInstance = $uibModal.open({

        templateUrl: 'app/components/modal/ConfirmModal.html',
        controllerAs: 'vm',
        size: 'sm',

        controller: function ConfirmModalController ($uibModalInstance) {

          var me = this;

          angular.extend (me, angular.extend({

            title: 'Внимание!',
            text: 'Вы действительно хотите сделать это?',

            buttons: {
              yes: 'Да',
              no: 'Нет'
            },

            submit: function () {
              $uibModalInstance.close();
            },

            cancel: function () {
              $uibModalInstance.dismiss();
            }

          },config));

          return me;

        }

      });

      return modalInstance.result;

    }

    return {
      show: show
    };

  }

  angular.module('sistemiumBootstrap')
    .service('ConfirmModal', ConfirmModal)
  ;

})();
