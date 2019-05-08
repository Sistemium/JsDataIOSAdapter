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

      $onInit() {

        const { warehouseBoxId } = vm;

        vm.setBusy(getData(warehouseBoxId))

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

    });


    function getData(warehouseBoxId) {

      return WarehouseBoxing.findBoxById(warehouseBoxId)
        .then(warehouseBox => {
          vm.warehouseBox = warehouseBox;
          return WarehouseBoxing.findBoxItems(warehouseBoxId)
            .then(items => {
              vm.items = items;
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

    function setArticles(items) {
      const grouped = _.groupBy(items, 'articleId');
      vm.articles = _.map(grouped, (articleItems, id) => {
        return { id, items: articleItems, article: articleItems[0].article };
      });
    }

  }

})();
