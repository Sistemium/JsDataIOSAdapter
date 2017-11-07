(function () {

  angular.module('core.services').component('syncerIndicator', {


    bindings: {
    },

    controller: syncerIndicatorController,

    templateUrl: 'app/components/syncerIndicator/syncerIndicator.html',
    controllerAs: 'vm'

  });

  function syncerIndicatorController($scope, SyncerInfo, toastr, $window, IOS) {

    const vm = _.assign(this, {
      $onInit,
      syncerInfoClick
    });

    function $onInit() {
      SyncerInfo.watch($scope, _.debounce(info => _.assign(vm, info), 1000));
    }

    function syncerInfoClick() {

      let text = 'Проверьте подключение к интернет или обратитесь в техподдержку';
      let title = 'Требуется передать данные';
      let style = 'error';

      if (vm.isSending) {
        title = 'Идет передача данных на сервер';
        text = 'Не разрывайте соединение с интернет, пока это облако не пропадет';
        style = 'info';
      }

      const options = {};

      if (IOS.isIos() && !vm.isSending) {
        IOS.handler('remoteControl').postMessage({
          remoteCommands: {
            STMSyncer: 'upload'
          }
        });
      }

      toastr[style](text, title, options);

    }

  }

})();
