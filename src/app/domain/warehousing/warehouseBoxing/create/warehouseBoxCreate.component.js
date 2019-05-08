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
        $scope.$on('WarehouseBoxing.create.scan.stamp', (e, code) => onStampScan(code));

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

    let scanBusy = false;

    function onStampScan(barcode) {

      const existing = _.findIndex(vm.items, { barcode }) + 1;

      if (existing) {
        return WarehouseBoxing.replyItemAgain(existing);
      }

      if (scanBusy) {
        return WarehouseBoxing.replyBusy();
      }

      scanBusy = true;

      WarehouseBoxing.findItemByBarcode(barcode)
        .then(warehouseItem => {

          if (!warehouseItem) {
            return WarehouseBoxing.replyNotFound();
          }

          vm.items.push(warehouseItem);

          setArticles(vm.items);

          WarehouseBoxing.replyItemScan(vm.items.length);

        })
        .finally(() => {
          scanBusy = false;
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
