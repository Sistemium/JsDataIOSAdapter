'use strict';

(function () {

  function ConfirmModal($uibModal) {

    function show(config, modalConfig) {

      var modalInstance = $uibModal.open(angular.extend({

        templateUrl: 'app/components/modal/ConfirmModal.html',
        controllerAs: 'vm',
        size: 'sm',

        controller: ['$uibModalInstance', function ConfirmModalController ($uibModalInstance) {

          var me = this;

          angular.extend(me, angular.extend({

            title: 'Внимание!',
            text: 'Вы действительно хотите сделать это?',

            buttons: {
              yes: 'Да',
              no: 'Нет'
            },

            hideCloseButton: false,

            submit: function () {
              $uibModalInstance.close();
            },

            cancel: function () {
              $uibModalInstance.dismiss();
            },

            deleteItem: function () {
              if (!me.confirmationMode) {
                me.confirmationMode = true;
              } else {
                me.busy = me.deleteDelegate()
                  .then(me.cancel);
              }
            }

          }, config));

          if (config.resolve) {
            config.resolve(me);
          }

          return me;

        }]

      }, modalConfig));

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
