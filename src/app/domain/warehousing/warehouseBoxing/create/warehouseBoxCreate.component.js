(function () {

  angular.module('Warehousing')
    .component('warehouseBoxCreate', {

      bindings: {
        barcode: '<',
      },

      controller: warehouseBoxCreateController,

      templateUrl: 'app/domain/warehousing/warehouseBoxing/create/warehouseBoxCreate.html',
      controllerAs: 'vm',

    });

  function warehouseBoxCreateController(saControllerHelper, $scope, WarehouseBoxing) {

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      articles: [],
      items: [],

      $onInit() {

        WarehouseBoxing.replyNewBox();
        $scope.$watch(WarehouseBoxing.popWarehouseItem, item => item && onStampScan(item));

      },

      cancelClick() {
        WarehouseBoxing.goRootState();
      },

      saveClick() {

        const busy = WarehouseBoxing.createBoxWithItems(vm.barcode, vm.items)
          .then(warehouseBox => WarehouseBoxing.goBoxInfo(warehouseBox))
          .catch(e => {
            console.error(e);
            return WarehouseBoxing.replyNotConnected();
          });

        vm.setBusy(busy);

      },

    });

    function onStampScan(warehouseItem) {

      const existing = _.findIndex(vm.items, { id: warehouseItem.id }) + 1;

      if (existing) {
        return WarehouseBoxing.replyItemAgain(existing);
      }

      if (vm.items.length && vm.items[0].articleId !== warehouseItem.articleId) {
        return WarehouseBoxing.replyNotTheSameArticle();
      }

      vm.items.push(warehouseItem);

      setArticles(vm.items);

      WarehouseBoxing.replyItemScan(vm.items.length);

    }

    function setArticles(items) {

      const grouped = _.groupBy(items, 'articleId');

      vm.articles = _.map(grouped, (articleItems, id) => {
        return { id, items: articleItems, article: articleItems[0].article };
      });

    }

  }

})();
