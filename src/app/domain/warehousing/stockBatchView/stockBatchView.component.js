(function () {

  angular.module('Warehousing')
    .component('stockBatchView', {

      bindings:{
        stockBatch: '<ngModel',
      },

      controller() {

      },

      templateUrl: 'app/domain/warehousing/stockBatchView/stockBatchView.html',
      controllerAs: 'vm',

    });

})();
