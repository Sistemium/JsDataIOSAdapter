'use strict';

(function () {

  angular.module('webPage')
    .controller('PickingOrderListController', function ($scope, models) {

      var vm = this;
      var PO = models.PickingOrder;

      vm.selectedItems = [];
      vm.total = 0;

      models.PickingOrder.bindAll({}, $scope, 'vm.pickingOrders');
      models.PickingOrder.bindAll({
        selected: true
      }, $scope, 'vm.selectedItems');

      PO.findAll({}).then(function (res) {
        res.forEach(function (i) {
          PO.loadRelations(i).then(function (r) {
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
            return PO.agg.totalVolume (vm.pickingOrders);
          },

          boxVolume: function () {
            return PO.agg.totalBoxVolume (vm.pickingOrders);
          },

          positionsCount: function () {
            return PO.agg.totalPositionsCount (vm.pickingOrders);
          }

        }

      });

    })
  ;

}());
