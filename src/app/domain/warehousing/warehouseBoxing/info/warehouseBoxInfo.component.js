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


  function warehouseBoxInfoController(saControllerHelper, $scope, WarehouseBoxing, ConfirmModal) {

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      confirmedItems: [],

      $onInit() {

        const { warehouseBoxId } = this;

        this.setBusy(getData(warehouseBoxId)
          .then(() => {
            $scope.$on('WarehouseBoxing.scan.warehouseItem', (e, item) => onStampScan(item));
          }));

      },

      withdrawClick() {
        askAndSaveBox(this.items);
      },

      rescanClick() {
        vm.setBusy(getData(this.warehouseBox.id));
      },

      confirmClick() {
        askAndSaveBox(this.confirmedItems, this.items);
      },

    });

    function askAndSaveBox(boxItems, removedItems = []) {

      const { warehouseBox } = vm;

      const verb = warehouseBox.processing === 'picked'
        ? 'Вернуть на склад' : 'Подтвердить наличие на складе';

      const text = _.filter([
        `${verb} ${boxItems.length}б.`,
        removedItems.length ? `и удалить ${removedItems.length}б.` : '',
        `в коробке ${warehouseBox.barcode}?`
      ]).join(' ');

      ConfirmModal.show({ text })
        .then(() => {

          const busy = saveBox(boxItems, removedItems)
            .then(() => {
              WarehouseBoxing.replyDone();
              return getData(warehouseBox.id);
            })
            .catch(e => {
              console.error(e);
              WarehouseBoxing.replyNotConnected();
            });

          vm.setBusy(busy);

        })
        .catch(_.noop);

    }

    function saveBox(boxItems, removedItems = []) {

      return WarehouseBoxing.moveBoxToStock(vm.warehouseBox, boxItems)
        .then(() => {
          if (removedItems.length) {
            return WarehouseBoxing.removeItemsFromBox(vm.warehouseBox, removedItems);
          }
        });

    }

    function onStampScan(warehouseItem) {

      const existing = _.findIndex(vm.confirmedItems, { id: warehouseItem.id }) + 1;

      if (existing) {
        return WarehouseBoxing.replyItemAgain(existing);
      }

      vm.confirmedItems.push(warehouseItem);

      setArticles(vm.items, vm.confirmedItems);

      WarehouseBoxing.replyItemScan(vm.confirmedItems.length);

    }

    function getData(warehouseBoxId) {

      return WarehouseBoxing.findBoxById(warehouseBoxId)
        .then(warehouseBox => {
          vm.warehouseBox = warehouseBox;
          return WarehouseBoxing.findBoxItems(warehouseBoxId)
            .then(items => {
              vm.items = items;
              vm.confirmedItems = [];
              setArticles(items);
              WarehouseBoxing.replyBoxInfo(warehouseBox, items);
              return warehouseBox;
            });
        })
        .then(warehouseBox => {
          return WarehouseBoxing.findBoxPickingOwner(warehouseBox)
            .then(pickingOrder => {
              vm.pickingOrder = pickingOrder;
            });
        })
        .catch(e => {
          console.error(e);
          WarehouseBoxing.replyNotConnected();
        });

    }

    function setArticles(items, confirmedItems = []) {

      _.pullAllBy(items, confirmedItems, 'id');

      const allItems = _.union(items, confirmedItems);

      const grouped = _.groupBy(allItems, 'articleId');

      vm.articles = _.map(grouped, (articleItems, articleId) => {

        const articleConfirmed = _.filter(confirmedItems, { articleId });
        const confirmed = articleConfirmed.length === articleItems.length;

        return {
          id: articleId,
          items: articleItems,
          confirmedItems: articleConfirmed,
          article: articleItems[0].article,
          confirmationStatus: confirmed ? '✅' : '⚠️',
        };
      });

    }

  }

})();
