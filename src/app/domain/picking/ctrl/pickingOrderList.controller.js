'use strict';

(function () {

  angular.module('webPage')
    .controller('PickingOrderListController', function ($scope, models) {

      var vm = this;
      var PO = models.PickingOrder;
      var POP = models.PickingOrderPosition;

      vm.selectedItems = [];

      models.PickingOrder.bindAll({}, $scope, 'vm.pickingOrders');
      models.PickingOrder.bindAll({
        selected: true
      }, $scope, 'vm.selectedItems');

      PO.findAll({}).then(function (res) {
        res.forEach(function (i) {
          PO.loadRelations(i).then(function (r) {
            _.each (r.positions, function (pos) {
              POP.loadRelations (pos,'Article');
            });
          });
        });
      });

      angular.extend(vm, {

        toggleSelect: function (item) {
          item.selected = !item.selected;
        },

        totals: PO.agg (vm, 'pickingOrders'),
        selectedTotals: PO.agg (vm, 'selectedItems'),

        currentTotals: function () {
          return vm.selectedItems.length ? vm.selectedTotals : vm.totals
        }

      });

    })
  ;

}());
