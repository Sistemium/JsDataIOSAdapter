'use strict';

(function () {

  function ConfirmModal($uibModal) {

    function show(config, modalConfig) {

      var modalInstance = $uibModal.open(angular.extend({

        templateUrl: 'app/components/modal/ConfirmModal.html',
        controllerAs: 'vm',
        size: 'sm',

        controller: ['$uibModalInstance', function ConfirmModalController($uibModalInstance) {

          var me = this;

          angular.extend(me, angular.extend({

            title: 'Внимание!',
            text: 'Вы действительно хотите сделать это?',

            submit: function (buttonId) {
              $uibModalInstance.close(buttonId);
            },

            cancel: function (buttonId) {
              $uibModalInstance.dismiss(buttonId);
            },

            buttons: [
              {
                title: 'Да',
                id: 'yes',
                type: 'submit'
              },
              {
                title: 'Нет',
                id: 'no',
                type: 'cancel'
              }
            ],

            hideCloseButton: false,

            buttonClick: function (buttonId, buttonType) {
              switch (buttonType) {
                case 'submit':
                {
                  me.submit(buttonId);
                  break;
                }
                case 'cancel':
                {
                  me.cancel(buttonId);
                  break;
                }
              }
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

          if (me.text && !_.isString(me.text)) {
            me.text = angular.toJson(me.text);
          }

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
