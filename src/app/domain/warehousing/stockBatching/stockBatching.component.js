(function () {

  angular.module('Warehousing')
    .component('stockBatching', {

      bindings:{
      },

      controller() {

        Object.assign(this, {
          barcode: {
            code: ''
          },
        });

      },

      templateUrl: 'app/domain/warehousing/stockBatching/stockBatching.html',
      controllerAs: 'vm',

    });

})();
