(function () {

  angular.module('core.services').component('syncerIndicator', {


    bindings: {
    },

    controller: syncerIndicatorController,

    templateUrl: 'app/components/syncerIndicator/syncerIndicator.html',
    controllerAs: 'vm'

  });

  function syncerIndicatorController($scope, SyncerInfo, toastr) {

    const vm = _.assign(this, {
      $onInit,
      syncerInfoClick
    });

    function $onInit() {
      SyncerInfo.watch($scope, info => _.assign(vm, info));
    }

    function syncerInfoClick() {
      const text = 'Проверьте подключение к интернет или обратитесь в техподдержку';
      const title = 'Требуется передать данные';
      const options = {
        onTap: () => {
          console.info('Пробуем передать данные');
        }
      };
      toastr.error(text, title, options);
    }

  }

})();
