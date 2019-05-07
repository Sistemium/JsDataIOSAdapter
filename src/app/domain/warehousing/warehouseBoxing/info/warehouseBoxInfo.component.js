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

        const text = `Вернуть на склад коробку ${vm.warehouseBox.barcode}?`;

        ConfirmModal.show({ text })
          .then(() => {
            return WarehouseBoxing.moveBoxToStock(vm.warehouseBox, vm.items)
              .then(() => vm.pickingOrder = null)
              .catch(e => console.error(e));
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
              return warehouseBox;
            });
        })
        .then(warehouseBox => {
          return WarehouseBoxing.findBoxPickingOwner(warehouseBox)
            .then(pickingOrder => {
              vm.pickingOrder = pickingOrder;
              return WarehouseBoxing.replyBoxInfo(warehouseBox);
            });
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
