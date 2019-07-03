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
          });

      }

    });

  }

})();
