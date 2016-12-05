'use strict';

(function () {

  function SaleOrderDetailsController(Schema, $scope, saControllerHelper, $state, $q) {

    let vm = saControllerHelper.setup(this, $scope);
    let {SaleOrderPosition, SaleOrder} = Schema.models();

    vm.use({});

    getPositions();

    /*
     Listeners
     */

    SaleOrder.bindOne($state.params.id, $scope, 'vm.saleOrder');

    /*
     Functions
     */

    function getPositions() {
      vm.setBusy(getData());
    }

    function getData() {
      return SaleOrder.find($state.params.id)
        .then(saleOrder => SaleOrder.loadRelations(saleOrder))
        .then(saleOrder => {
          return $q.all(_.map(saleOrder.positions, position => SaleOrderPosition.loadRelations(position)));
        })
    }

  }

  angular.module('webPage')
    .controller('SaleOrderDetailsController', SaleOrderDetailsController);

}());
