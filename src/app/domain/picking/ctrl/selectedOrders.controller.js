'use strict';

(function () {

  angular.module('webPage')
    .controller('SelectedOrdersController', function (models, $scope) {

      var PO = models.PickingOrder;
      var vm = this;

      PO.findAll().then(function () {

        vm.selectedItems = $scope.vm.selectedItems || PO.filter({
            selected: true
        });

      });

      vm.totals = PO.agg (vm, 'selectedItems');

    })
  ;

}());
