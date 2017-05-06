'use strict';

(function () {

  function ShipmentDetailsController(Schema, $scope, saControllerHelper, $state, $q) {

    const vm = saControllerHelper
      .setup(this, $scope);

    const {Shipment} = Schema.models();

    vm.use({

      setItemClick

    });

    vm.setBusy(getData());

    /*
     Listeners
     */

    Shipment.bindOne($state.params.id, $scope, 'vm.shipment');

    /*
     Functions
     */

    function setItemClick(item) {
      if (!item.id) return;
      $state.go('.', {id: item.id});
    }

    function getData() {

      return Shipment.find($state.params.id)
        .then(item => item.DSLoadRelations('ShipmentPosition'))
        .then(item => $q.all(_.map(item.positions, position => position.DSLoadRelations())))
        .catch(e => console.error(e));

    }

  }

  angular.module('webPage')
    .controller('ShipmentDetailsController', ShipmentDetailsController);

}());
