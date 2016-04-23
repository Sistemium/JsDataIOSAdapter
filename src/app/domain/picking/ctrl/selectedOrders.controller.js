'use strict';

(function () {

  angular.module('webPage')
    .controller('SelectedOrdersController', function (models, $scope, $state) {

      var PO = models.PickingOrder;
      var vm = this;

      angular.extend(vm,{

        selectedItems: $scope.$parent.vm.pickingItems || $scope.$parent.vm.selectedItems,
        totals: PO.agg (vm, 'selectedItems'),

        startPicking: function () {
          vm.selectedItems = _.map(vm.selectedItems,function(po){
            po.processing = 'picking';
            PO.save(po);
            return po;
          });
          $scope.$parent.vm.pickingItems = vm.selectedItems;
          $state.go('^.articleList');
        },

        finishPicking: function () {
          _.each(vm.selectedItems,function(po){
            po.processing = 'picked';
            po.selected = undefined;
            PO.save(po);
          });
          $scope.$parent.vm.pickingItems = false;
          $state.go('^');
        },

        pausePicking: function () {
          _.each(vm.selectedItems,function(po){
            po.processing = 'ready';
            po.selected = undefined;
            PO.save(po);
          });
          $scope.$parent.vm.pickingItems = false;
          $state.go('^');
        }

      });

    })
  ;

}());
