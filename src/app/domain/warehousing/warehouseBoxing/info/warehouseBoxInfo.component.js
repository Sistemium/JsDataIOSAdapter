(function () {

  angular.module('Warehousing')
    .component('warehouseBoxInfo', {

      bindings: {
        warehouseBoxId: '<',
      },

      controller: warehouseBoxInfoController,

      templateUrl: 'app/domain/warehousing/warehouseBoxing/info/warehouseBoxInfo.html',
      controllerAs: 'vm',

    });


  function warehouseBoxInfoController(saControllerHelper, $scope, WarehouseBoxing) {

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      $onInit() {

        const { warehouseBoxId } = vm;

        vm.setBusy(getData(warehouseBoxId))

      },

    });


    function getData(warehouseBoxId) {

      return WarehouseBoxing.findBoxById(warehouseBoxId)
        .then(warehouseBox => {
          vm.warehouseBox = warehouseBox;
          return WarehouseBoxing.findBoxItems(warehouseBoxId);
        })
        .then(items => {
          vm.items = items;
          return setArticles(items);
        });

    }

    function setArticles(items) {
      const grouped = _.groupBy(items, 'articleId');
      vm.articles = _.map(grouped, (articleItems, id) => {
        return { id, items: articleItems, article: articleItems[0].article };
      });
    }

  }

})();
