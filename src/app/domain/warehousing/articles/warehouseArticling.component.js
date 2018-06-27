(function () {

  angular.module('Warehousing')
    .component('warehouseArticling', {
      bindings: {},

      controllerAs: 'vm',
      templateUrl: 'app/domain/warehousing/articles/warehouseArticling.html',

      controller: WarehouseArticlingController,

    });

  function WarehouseArticlingController($scope, saControllerHelper, Schema) {

    const vm = saControllerHelper.setup(this, $scope);

    const { Article } = Schema.models();

    vm.use({

      $onInit() {

        const orderBy = [['name']];
        vm.rebindAll(Article, { orderBy }, 'vm.articles');
        vm.setBusy(Article.findAll({}, {}));

      },

    });

  }

})();
