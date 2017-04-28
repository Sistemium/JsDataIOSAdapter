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
      toastr.error('Проверьте подключение к интернет или обратитесь в техподдержку', 'Требуется передать данные')
    }

  }

})();
