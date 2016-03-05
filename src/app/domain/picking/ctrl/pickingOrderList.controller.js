'use strict';

(function () {

  angular.module('webPage')
    .controller('PickingOrderListController', function ($scope, models) {

      var vm = this;
      vm.selectedItems = [];
      vm.total = 0;

      models.PickingOrder.bindAll({}, $scope, 'vm.pickingOrders');
      models.PickingOrder.bindAll({
        selected: true
      }, $scope, 'vm.selectedItems');

      models.PickingOrder.findAll({}).then(function (res) {
        res.forEach(function (i) {
          models.PickingOrder.loadRelations(i).then(function (r) {
            vm.total += r.positions.length;
            _.each (r.positions, function (pos) {
              models.PickingOrderPosition.loadRelations (pos);
            });
          });
        });
      });

      angular.extend(vm, {

        toggleSelect: function (item) {
          item.selected = !item.selected;
        },

        totals: {

          volume: function () {
            return _.reduce(vm.pickingOrders, function(sum,order){
              return sum + order.totalVolume();
            },0);
          },

          boxVolume: function () {
            return _.reduce(vm.pickingOrders, function(sum,order){
              return sum + order.totalBoxVolume();
            },0);
          },

          positionsCount: function () {
            return _.reduce(vm.pickingOrders, function(sum,order){
              return sum + order.positions.length;
            },0);
          }

        }

      });

    })
  ;

}());
