(function () {

  angular.module('Warehousing')
    .component('stockBatchView', {

      bindings:{
        stockBatch: '<',
      },

      controller() {

      },

      templateUrl: 'app/domain/warehousing/stockBatchView/stockBatchView.html',
      controllerAs: 'vm',

    });

})();
