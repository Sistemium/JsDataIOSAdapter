'use strict';

(function () {

  angular.module('webPage')
    .controller('SelectedOrdersController', function (models, $state, $scope) {

      var PO = models.PickingOrder;
      var vm = this;

      PO.findAll().then(function () {

        PO.bindAll({
          selected: true
        }, $scope, 'vm.d');

        vm.selectedItems = $scope.vm.selectedItems || PO.filter({
            selected: true
        });

        if (!vm.selectedItems.length) {
          $state.go ('picking.orderList');
        }

      });

      vm.totals = PO.agg (vm, 'selectedItems');

    })
  ;

}());
