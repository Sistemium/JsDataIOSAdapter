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
      stamps: [],
      currentItem: null,
      currentStamp: null,
      stockBatch: null,

      $onInit() {

        WarehouseBoxing.replyNewBox();
        $scope.$watch(WarehouseBoxing.popWarehouseItem, item => item && onStampScan(item));
        $scope.$watch(WarehouseBoxing.popPlainStamp, stamp => stamp && onPlainStamp(stamp));
        $scope.$watch(WarehouseBoxing.popStockBatch, sb => sb && onStockBatch(sb));

      },

      cancelClick() {
        WarehouseBoxing.goRootState();
      },

      saveClick() {

        const busy = saveItems()
          .then(saveStamps)
          .then(warehouseBox => WarehouseBoxing.goBoxInfo(warehouseBox));

        vm.setBusy(busy)
          .catch(() => WarehouseBoxing.replyNotConnected());

      },

      removeItemClick() {
        const { currentItem, items, currentStamp } = this;
        if (currentItem) {
          _.remove(items, { id: currentItem.id });
          this.currentItem = null;
          setArticles(items);
        }
        if (currentStamp) {
          _.remove(this.stamps, s => s === vm.currentStamp);
          this.currentStamp = null;
        }
      },

      stampLabel(stamp = this.currentStamp) {
        return stamp.substr(-10);
      }

    });

    function saveItems() {
      return WarehouseBoxing.createBoxWithItems(vm.barcode, vm.items);
    }

    function saveStamps(box) {

      const { id: warehouseBoxId } = box;
      const { barcode, stamps } = vm;
      const { barcode: stockBatchBarcode, articleId } = vm.stockBatch;

      return WarehouseBoxing.confirmBox({
        stockBatchBarcode,
        articleId,
        barcode,
        stamps,
        warehouseBoxId,
      })
        .then(() => box);

    }

    function onStockBatch(stockBatch) {
      if (vm.items.length) {
        return WarehouseBoxing.replyError('Старая партия');
      }

      vm.stockBatch = stockBatch;
    }

    function onPlainStamp(stamp) {

      if (vm.items.length) {
        return WarehouseBoxing.replyError('Неизвестная марка');
      }

      if (!vm.stockBatch) {
        return WarehouseBoxing.replyError('Сначала просканируйте наклейку партии');
      }

      vm.currentStamp = stamp;

      const existing = vm.stamps.indexOf(stamp) + 1;

      if (existing) {
        return WarehouseBoxing.replyItemAgain(existing);
      }

      vm.stamps.push(stamp);

      WarehouseBoxing.replyItemScan(vm.stamps.length);

    }

    function onStampScan(warehouseItem) {

      if (vm.stamps.length) {
        return WarehouseBoxing.replyError('В коробке есть неизвестные марки');
      }

      const existing = _.findIndex(vm.items, { id: warehouseItem.id }) + 1;

      vm.currentItem = warehouseItem;

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
