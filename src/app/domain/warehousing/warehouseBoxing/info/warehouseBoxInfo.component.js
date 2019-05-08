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

        const { warehouseBoxId } = vm;

        vm.setBusy(getData(warehouseBoxId)
          .then(() => {
            $scope.$on('WarehouseBoxing.scan.warehouseItem', (e, item) => onStampScan(item));
          }));

      },

      withdrawClick() {

        const text = `Вернуть на склад ${vm.items.length}б. в коробке ${vm.warehouseBox.barcode}?`;

        ConfirmModal.show({ text })
          .then(() => {

            const busy = WarehouseBoxing.moveBoxToStock(vm.warehouseBox, vm.items)
              .then(() => {
                vm.pickingOrder = null;
                WarehouseBoxing.replyDone();
              })
              .catch(e => {
                console.error(e);
                WarehouseBoxing.replyNotConnected();
              });

            vm.setBusy(busy);

          })
          .catch(_.noop);
      },

      rescanClick() {
        vm.setBusy(getData(vm.warehouseBox.id));
      },

      confirmClick() {

        const text = [
          `Подтвердить наличие на складе ${vm.confirmedItems.length}б.`,
          `в коробке ${vm.warehouseBox.barcode}?`
        ].join(' ');

        ConfirmModal.show({ text })
          .then(() => {

            const busy = WarehouseBoxing.moveBoxToStock(vm.warehouseBox, vm.confirmedItems)
              .then(() => WarehouseBoxing.removeItemsFromBox(vm.warehouseBox, vm.items))
              .then(() => {
                WarehouseBoxing.replyDone();
                return getData(vm.warehouseBox.id);
              })
              .catch(e => {
                console.error(e);
                WarehouseBoxing.replyNotConnected();
              });

            vm.setBusy(busy);

          })
          .catch(_.noop);
      },

    });

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
