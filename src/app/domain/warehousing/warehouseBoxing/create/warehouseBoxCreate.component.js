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

      $onInit() {

        WarehouseBoxing.replyNewBox();
        $scope.$watch(WarehouseBoxing.popWarehouseItem, item => item && onStampScan(item));
        $scope.$watch(WarehouseBoxing.popPlainStamp, stamp => stamp && onPlainStamp(stamp));

      },

      cancelClick() {
        WarehouseBoxing.goRootState();
      },

      saveClick() {

        const busy = vm.items.length ? saveItems() : saveStamps();

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
      return WarehouseBoxing.createBoxWithItems(vm.barcode, vm.items)
        .then(warehouseBox => WarehouseBoxing.goBoxInfo(warehouseBox));
    }

    function saveStamps() {
      const { barcode, stamps } = vm;
      return WarehouseBoxing.confirmBox({ barcode, stamps })
        .then(confirmed => WarehouseBoxing.goConfirmedBoxInfo(confirmed));
    }

    function onPlainStamp(stamp) {

      if (vm.items.length) {
        return WarehouseBoxing.replyError('В коробке есть известные марки');
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
