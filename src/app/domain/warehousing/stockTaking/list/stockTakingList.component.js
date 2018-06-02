(function () {

  angular.module('Warehousing')
    .component('stockTakingList', {

      bindings: {
        stockTakings: '=ngModel',
        onClick: '&onClick',
      },

      controller: StockTakingListController,

      templateUrl: 'app/domain/warehousing/stockTaking/list/stockTakingList.html',
      controllerAs: 'vm',

    });

  /** @ngInject */
  function StockTakingListController(Schema, saControllerHelper, $scope) {

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      $onInit() {
        //
      },

      stockTakingClick($item) {
        vm.onClick({ $item });
      }

    });

  }

})();
