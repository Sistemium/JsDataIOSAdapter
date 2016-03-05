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

      vm.totals = {
        volume: function () {
          return _.reduce(vm.selectedItems,function(sum,order){
            return sum + order.totalVolume();
          },0);
        },
        positions: function () {
          return _.reduce(vm.selectedItems,function(sum,order){
            return sum + order.positions.length;
          },0);
        }
      };

    })
  ;

}());
