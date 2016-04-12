'use strict';

(function () {

  angular.module('webPage')
    .controller('SelectedOrdersController', function (models, $scope, $state) {

      var PO = models.PickingOrder;
      var vm = this;

      angular.extend(vm,{

        selectedItems: $scope.$parent.vm.selectedItems,
        totals: PO.agg (vm, 'selectedItems'),

        startPicking: function () {
          _.each(vm.selectedItems,function(po){
            po.processing = 'picking';
            PO.save(po);
          });
          $state.go('^.articleList');
        },

        finishPicking: function () {
          _.each(vm.selectedItems,function(po){
            po.processing = 'picked';
            po.selected = undefined;
            PO.save(po);
          });
          $state.go('^');
        },

        pausePicking: function () {
          _.each(vm.selectedItems,function(po){
            po.processing = 'ready';
            po.selected = undefined;
            PO.save(po);
          });
          $state.go('^');
        }

      });

    })
  ;

}());
