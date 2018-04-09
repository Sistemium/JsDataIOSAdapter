(function () {

  angular.module('Sales')
    .component('shipmentDetails', {

      bindings: {
        shipmentId: '<',
        offsetTop: '<'
      },

      templateUrl: 'app/domain/sales/shipment/shipmentDetails/shipmentDetails.html',

      controller: shipmentDetailsController,
      controllerAs: 'vm'

    });


  function shipmentDetailsController(Schema, $scope, saControllerHelper, $q) {

    const {Shipment} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      $onInit

    });

    /*
    Init
     */

    function $onInit() {

      const {Shipment} = Schema.models();

      if (vm.shipmentId) {
        Shipment.find(vm.shipmentId);
        Shipment.bindOne(vm.shipmentId, $scope, 'vm.shipment');
        vm.setBusy(getData(vm.shipmentId));
      }

      vm.offsetTop = vm.offsetTop || 5;

    }

    /*
     Functions
     */

    function getData(shipmentId) {

      let bypassCache = true;

      // TODO: subscribe to socket and do not bypassCache

      return Shipment.find(shipmentId, {bypassCache})
        .then(item => item.DSLoadRelations('ShipmentPosition', {bypassCache}))
        .then(item => $q.all(_.map(item.positions, position => {
          return position.DSLoadRelations()
            .catch(_.noop);
        })))
        .catch(e => {
          vm.error = e;
        });
    }

  }

})();
