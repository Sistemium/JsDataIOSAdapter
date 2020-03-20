(function () {

  angular.module('Warehousing')
    .component('warehousePaletteInfo', {

      bindings: {
        warehousePaletteId: '<',
      },

      controller: warehousePaletteInfoController,

      templateUrl: 'app/domain/warehousing/warehouseBoxing/palette/warehousePaletteInfo.html',
      controllerAs: 'vm',

    });


  function warehousePaletteInfoController(saControllerHelper, $scope, Language,
                                          WarehouseBoxing, ConfirmModal) {

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({


      $onInit() {

        const { warehousePaletteId } = this;

        if (!warehousePaletteId) {
          return;
        }

        this.setBusy(getData(warehousePaletteId))
          .then(() => {
            // $scope.$watch(WarehouseBoxing.popWarehouseItem, item => item && onStampScan(item));
          });

      },

      confirmPaletteClick() {

        const { barcode, id: warehousePaletteId } = this.warehousePalette;
        const warehouseBoxIds = _.map(vm.boxes, 'id');

        const text = [
          `Подтвердить наличие целой палеты ${barcode}`,
          `на которой ${Language.speakableBoxPcs({ box: warehouseBoxIds.length })}?`
        ].join(' ');

        ConfirmModal.show({ text })
          .then(() => {
            const confirmedPalette = { barcode, warehouseBoxIds, warehousePaletteId };
            return WarehouseBoxing.confirmPalette(confirmedPalette)
              .then(lastConfirmed => {
                vm.lastConfirmed = lastConfirmed;
              });
          })
          .then(() => {
            WarehouseBoxing.replyDone();
          })
          .catch(_.noop);

      },

      isFullPalette() {
        return true;
      },

      isFullBox() {
        return _.get(vm.warehouseBox, 'processing') === 'stock'
          && _.get(vm.items, 'length');
      },

    });

    function getData(warehousePaletteId) {

      vm.lastConfirmed = null;

      return warehousePaletteId && WarehouseBoxing.findPaletteById(warehousePaletteId)
        .then(warehousePalette => {

          vm.warehousePalette = warehousePalette;

          return warehousePalette && WarehouseBoxing.lastConfirmedPalette(warehousePalette)
            .then(lastConfirmed => {
              vm.lastConfirmed = lastConfirmed;
            });
        })

        .then(() => vm.warehousePalette.findPaletteBoxes({}))
        .then(boxes => {
          vm.boxes = boxes;
          return WarehouseBoxing.findPaletteItems(_.map(boxes, 'id'));
        })
        .then(items => {
          setArticles(items);
          WarehouseBoxing.replyPaletteInfo(vm.warehousePalette, vm.boxes);
        })
        // .then(setPickingOrder)
        .catch(e => {
          console.error(e);
          WarehouseBoxing.replyNotConnected();
        });

    }

    function setArticles(items) {

      const grouped = _.groupBy(items, 'articleId');

      vm.articles = _.map(grouped, (articleItems, articleId) => {

        return {
          id: articleId,
          items: articleItems,
          confirmedItems: [],
          article: articleItems[0].article,
          // confirmationStatus: confirmed ? '✅' : '⚠️',
        };
      });

      const boxById = _.keyBy(vm.boxes, 'id');

      vm.erroredItems = _.filter(items, item => {
        const { processing } = boxById[item.currentBoxId] || {};
        return processing === 'picked' && item.processing !== 'picked';
      });

    }

  }

})();
