'use strict';

(function () {

  angular.module('webPage')
    .controller('PickingOrderListController', function ($scope, models) {

      var vm = this;
      vm.selectedItems = [];
      vm.total = 0;

      models.PickingOrder.bindAll({}, $scope, 'vm.pickingOrders');
      models.PickingOrder.findAll({}).then(function (res) {
        res.forEach(function (i) {
          models.PickingOrder.loadRelations(i).then(function (r) {
            vm.total += r.PickingOrderPositions.length;
          });
        });
      });


      angular.extend(vm, {

        toggleSelect: function (item) {
          item.selected = !item.selected;
          if (item.selected) {
            vm.selectedItems.push(item);
          } else {
            _.remove(vm.selectedItems, item);
          }
        }

      });

    })
  ;

}());
