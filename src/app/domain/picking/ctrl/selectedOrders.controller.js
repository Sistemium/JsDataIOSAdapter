'use strict';

(function () {

  angular.module('webPage')
    .controller('SelectedOrdersController', function (Schema, $scope, $state) {

      var PO = Schema.model('PickingOrder');
      var POP = Schema.model('PickingOrderPosition');
      var vm = this;

      function ejectOthers () {
        Schema.model ('PickingOrderPositionPicked').ejectAll();
        Schema.model ('StockBatch').ejectAll();
      }

      var selected = $scope.$parent.vm.pickingItems || $scope.$parent.vm.selectedItems;

      _.each(selected,function(po){
        _.each (po.positions,function(pop) {
          POP.loadRelations(pop,['PickingOrderPositionPicked']);
        });
      });

      angular.extend(vm,{

        selectedItems: selected,
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
          ejectOthers();
          $state.go('^');
        },

        pausePicking: function () {
          _.each(vm.selectedItems,function(po){
            po.processing = 'ready';
            po.selected = undefined;
            PO.save(po);
          });
          $scope.$parent.vm.pickingItems = false;
          ejectOthers();
          $state.go('^');
        }

      });

    })
  ;

}());
