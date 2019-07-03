(function () {

  angular.module('webPage')
    .component('pickedBoxes', {

      bindings: {
        // picking: '<',
        orders: '<',
        // onDone: '&'
      },

      templateUrl: 'app/domain/picking/pickedBoxes/pickedBoxes.html',
      controller: PickedBoxesController,
      controllerAs: 'vm'

    });

  function PickedBoxesController($scope, saControllerHelper, Picking) {

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      palettesByOrder: [],
      boxesByOrder: [],
      boxesByPaletteId: {},
      selectedPalette: null,

      $onInit() {

        this.setBusy(this.refresh());

      },

      paletteClick(palette) {

        const { id } = palette;

        if (_.get(this.selectedPalette, 'id') === id) {
          this.selectedPalette = null;
          return;
        }

        const busy = Picking.boxedItems(this.boxesByPaletteId[id])
          .then(boxedItems => {
            this.selectedPalette = {
              id,
              title: palette.barcode,
              boxes: boxedItems,
            };
          });

        vm.setBusy(busy);

      },

      paletteBoxes({ id }) {
        return this.boxesByPaletteId[id] || [];
      },

      refresh() {

        return Picking.boxesByOrders(this.orders)
          .then(([boxes, palettes]) => {

            this.palettesByOrder = palettes;
            this.boxesByOrder = boxes;
            this.boxesByPaletteId = _.groupBy(_.flatten(boxes), 'currentPaletteId');

            const boxesByPaletteId = {};

            _.each(boxes, (orderBoxes, idx) => {
              _.assign(boxesByPaletteId, _.groupBy(orderBoxes, ({ currentPaletteId }) => {
                const { id } = vm.orders[idx];
                return currentPaletteId || id;
              }));
            });

            _.each(vm.orders, (order, idx) => {
              const { id } = order;
              if (boxesByPaletteId[id]) {
                this.palettesByOrder[idx].push({ id, barcode: 'Без палеты' });
              }
            });

            this.boxesByPaletteId = boxesByPaletteId;

          });

      }

    });

  }

})();
