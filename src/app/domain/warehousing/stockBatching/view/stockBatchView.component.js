(function () {

  angular.module('Warehousing')
    .component('stockBatchView', {

      bindings:{
        stockBatch: '<ngModel',
      },

      controller() {

      },

      templateUrl: 'app/domain/warehousing/stockBatching/view/stockBatchView.html',
      controllerAs: 'vm',

    });

})();
