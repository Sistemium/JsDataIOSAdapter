(function () {

  angular.module('Sales')
    .service('ShipmentModal', ShipmentModal);

  function ShipmentModal($uibModal) {

    return {show};

    function show(shipmentId) {

      let modal = $uibModal.open({

        animation: false,
        templateUrl: 'app/domain/sales/shipment/shipmentModal/shipmentModal.html',

        size: 'lg',
        controllerAs: 'vm',

        windowClass: 'shipment-modal modal-info',

        controller

      });

      modal.result
        .then(_.noop, _.noop);

      function controller() {
        this.shipmentId = shipmentId;
        this.closeClick = () => modal.close();
      }

    }

  }

})();
