'use strict';

(function () {

  angular.module('webPage')
    .controller('SelectedOrdersController', function (models, $state, $scope) {

      var PO = models.PickingOrder;

      PO.findAll().then(function () {

        PO.bindAll({
          selected: true
        }, $scope, 'vm.d');

        vm.data = PO.filter({
            selected: true
        });

        if (!vm.data.length) {
          $state.go ('picking.orderList');
        }

      });

      var vm = this;
      vm.selectedItems = $scope.vm.selectedItems;

      vm.totals = {
        volume: function () {
          return _.reduce(vm.data,function(sum,order){
            return sum + order.totalVolume();
          },0);
        },
        positions: function () {
          return _.reduce(vm.data,function(sum,order){
            return sum + order.positions.length;
          },0);
        }
      };

    })
  ;

}());
