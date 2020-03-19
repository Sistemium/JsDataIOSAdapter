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


  function warehouseBoxInfoController(saControllerHelper, $scope, WarehouseBoxing, ConfirmModal,
                                      moment) {

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      confirmedItems: [],
      currentItem: null,
      erroredItems: [],

      $onInit() {

        const { warehouseBoxId } = this;

        this.setBusy(getData(warehouseBoxId))
          .then(() => {
            $scope.$watch(WarehouseBoxing.popWarehouseItem, item => item && onStampScan(item));
          });

      },

      confirmBoxClick() {

        console.info('confirmBoxClick');

        const { barcode, id: warehouseBoxId } = this.warehouseBox;
        const warehouseItemIds = _.map(vm.items, 'id');

        const text = [
          `Подтвердить наличие целой коробки ${barcode}`,
        ].join(' ');

        ConfirmModal.show({ text })
          .then(() => {
            const confirmedBox = { barcode, warehouseItemIds, warehouseBoxId };
            return WarehouseBoxing.confirmBox(confirmedBox)
              .then(lastConfirmed => {
                vm.lastConfirmed = lastConfirmed;
              });
          })
          .then(() => {
            WarehouseBoxing.replyDone();
          })
          .catch(_.noop);

      },

      isFullBox() {
        return _.get(vm.warehouseBox, 'processing') === 'stock'
          && _.get(vm.items, 'length');
      },

      withdrawClick() {
        askAndSaveBox(this.items);
      },

      rescanClick() {
        vm.confirmedItems = [];
        vm.setBusy(getData(this.warehouseBox.id));
      },

      confirmWithdrawClick() {
        askAndSaveBox(this.confirmedItems, this.items);
      },

      confirmClick() {
        askAndSaveBox(this.confirmedItems, this.items, vm.warehouseBox.processing);
      },

      removeItemClick() {
        const { currentItem, items, confirmedItems } = this;
        _.remove(confirmedItems, { id: currentItem.id });
        if (currentItem.currentBoxId === this.warehouseBoxId) {
          items.push(currentItem);
        }
        this.currentItem = null;
        setArticles(items, confirmedItems);
      },

      boxOrderClick(pickingOrder) {

        const { barcode } = this.warehouseBox;
        const { date, ndoc } = pickingOrder;

        const text = [
          `Подтвердить наличие коробки ${barcode}`,
          `в требовании №${ndoc} от ${date}`,
        ].join(' ');

        ConfirmModal.show({ text })
          .then(() => {
            this.warehouseBox.ownerXid = pickingOrder.id;
            return WarehouseBoxing.moveBoxToStock(this.warehouseBox, [], 'picked');
          })
          .then(setPickingOrder)
          .then(() => {
            WarehouseBoxing.replyDone();
            setArticles(vm.items);
          })
          .catch(_.noop);
      },

      confirmLabel() {
        return this.boxOnStock() ? 'Подтвердить на складе' : 'Вернуть на склад';
      },

      boxOnStock() {
        return vm.warehouseBox && vm.warehouseBox.processing === 'stock';
      },

      boxIsPicked() {
        return vm.warehouseBox && vm.warehouseBox.processing === 'picked';
      },

    });

    function askAndSaveBox(boxItems, removedItems = [], processing = 'stock') {

      const { warehouseBox } = vm;
      const targetStateLabel = processing === 'stock' ? 'наличие на складе' : 'в заказе';

      const verb = warehouseBox.processing === processing
        ? `Подтвердить ${targetStateLabel}` : 'Вернуть на склад';

      const text = _.filter([
        `${verb} ${boxItems.length}б.`,
        removedItems.length ? `и удалить ${removedItems.length}б.` : '',
        `в коробке ${warehouseBox.barcode}?`
      ]).join(' ');

      ConfirmModal.show({ text })
        .then(() => {

          const busy = saveBox()
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

      function saveBox() {

        return WarehouseBoxing.moveBoxToStock(vm.warehouseBox, boxItems, processing)
          .then(() => {
            if (removedItems.length) {
              return WarehouseBoxing.removeItemsFromBox(vm.warehouseBox, removedItems);
            }
          });

      }

    }


    function onStampScan(warehouseItem) {

      vm.currentItem = warehouseItem;

      const existing = _.findIndex(vm.confirmedItems, { id: warehouseItem.id }) + 1;

      if (existing) {
        return WarehouseBoxing.replyItemAgain(existing);
      }

      vm.confirmedItems.push(warehouseItem);

      setArticles(vm.items, vm.confirmedItems);

      WarehouseBoxing.replyItemScan(vm.confirmedItems.length);

    }

    function getData(warehouseBoxId) {

      vm.lastConfirmed = null;

      return WarehouseBoxing.findBoxById(warehouseBoxId)
        .then(warehouseBox => {
          return warehouseBox && WarehouseBoxing.lastConfirmedBox(warehouseBox)
            .then(lastConfirmed => {
              vm.lastConfirmed = lastConfirmed;
              return warehouseBox;
            });
        })

        .then(warehouseBox => {

          vm.warehouseBox = warehouseBox;
          vm.currentItem = null;
          vm.confirmedItems = [];

          return WarehouseBoxing.findBoxItems(warehouseBoxId)
            .then(items => {
              vm.items = items;
              setArticles(items);
              WarehouseBoxing.replyBoxInfo(warehouseBox, items);
              return warehouseBox;
            });

        })
        .then(setPickingOrder)
        .catch(e => {
          console.error(e);
          WarehouseBoxing.replyNotConnected();
        });

    }

    function setPickingOrder(warehouseBox) {

      return WarehouseBoxing.findBoxPickingOwner(warehouseBox)
        .then(pickingOrder => {

          vm.boxOrders = [];
          vm.pickingOrder = pickingOrder;

          if (!vm.pickingOrder) {
            return WarehouseBoxing.findBoxOrders(warehouseBox)
              .then(boxOrders => {
                const today = moment().format();
                vm.boxOrders = _.filter(boxOrders, ({ date }) => date >= today);
              });
          }

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

      const { processing } = vm.warehouseBox;

      vm.erroredItems = _.filter(items, item => {
        return processing === 'picked' && item.processing !== 'picked';
      });

    }

  }

})();
