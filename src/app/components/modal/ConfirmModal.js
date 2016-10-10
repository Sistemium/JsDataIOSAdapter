'use strict';

(function () {

  function ConfirmModal($uibModal) {

    function showErrorAskRepeat(onSuccess, onError) {
      return (err) => {
        return showMessageAskRepeat(err, onSuccess, onError);
      };
    }

    function showMessageAskRepeat(msg, onSuccess, onError) {

      return show({
        text: msg.text || msg,
        question: 'Повторить попытку',
        textClass: 'text-danger',
        title: 'Ошибка!'
      },{
        windowClass: 'modal-warning'
      })
        .then(onSuccess, onError);

    }

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

            submit: (buttonId) => $uibModalInstance.close(buttonId),
            cancel: (buttonId) => $uibModalInstance.dismiss(buttonId),
            deleteItem: () => me.busy = me.deleteDelegate().then(me.cancel),

            buttonClick: (buttonId, buttonType) => {
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
      show,
      showErrorAskRepeat,
      showMessageAskRepeat
    };

  }

  angular.module('sistemiumBootstrap')
    .service('ConfirmModal', ConfirmModal)
  ;

})();
