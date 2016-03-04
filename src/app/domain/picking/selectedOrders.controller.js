'use strict';

(function () {

  angular.module('webPage')
    .controller('SelectedOrdersController', function ($state, $scope) {

      if (!$scope.vm.selectedItems.length) {
        $state.go('picking.pickingOrderList');
      }

      var vm = this;
      vm.total = 0;
      vm.selectedItems = $scope.vm.selectedItems;
      vm.selectedItems.forEach(function (i) {
        vm.total += i.positions.length;
      });

    })
  ;

}());
