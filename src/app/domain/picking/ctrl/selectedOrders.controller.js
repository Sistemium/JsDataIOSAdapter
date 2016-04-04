'use strict';

(function () {

  angular.module('webPage')
    .controller('SelectedOrdersController', function (models, $scope) {

      var PO = models.PickingOrder;
      var vm = this;

      vm.selectedItems = $scope.$parent.vm.selectedItems;

      vm.totals = PO.agg (vm, 'selectedItems');

    })
  ;

}());
