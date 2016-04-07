'use strict';

(function () {

  angular.module('webPage')
    .controller('PickingOrderListController', function ($scope, Schema, $state, Errors, BarCodeScanner, SoundSynth) {

      var picker = Schema.model ('Picker').getCurrent();

      if (!picker) {
        return $state.go ('login');
      }

      var vm = this;
      var PO = Schema.model ('PickingOrder');
      var POP = Schema.model ('PickingOrderPosition');
      var SB = Schema.model ('StockBatch');

      vm.selectedItems = [];

      function refresh() {
        var lastModified = PO.lastModified();
        PO.findAll({picker: picker.id}, {bypassCache: true})
          .then(function (res) {

            res.forEach(function (i) {
              PO.loadRelations(i).then(function (r) {
                _.each(r.positions, function (pos) {
                  POP.loadRelations(pos, ['Article', 'PickingOrderPositionPicked']);
                });
              });
            });

            if (!vm.selectedItems.length) {
              $state.go('picking.orderList');
            }

          })
          .then(function (){
            if (!lastModified) {
              return;
            }
            _.each (vm.pickingOrders, function (po) {
              if (po.DSLastModified() < lastModified) {
                PO.eject(po);
              }
            });
          });
      }

      PO.bindAll({
        picker: picker.id
      }, $scope, 'vm.pickingOrders');

      PO.bindAll({
        picker: picker.id,
        selected: true
      }, $scope, 'vm.selectedItems');

      angular.extend(vm, {

        toggleSelect: function (item) {
          item.selected = !item.selected;
        },

        totals: PO.agg (vm, 'pickingOrders'),
        selectedTotals: PO.agg (vm, 'selectedItems'),

        currentTotals: function () {
          return vm.selectedItems.length ? vm.selectedTotals : vm.totals
        },

        refresh: refresh

      });

      refresh();

      function scanFn(code) {

        Errors.clear();

        code = code || vm.barCodeInput;

        return SB.someBy.barCode(code).then(function (sbs) {

          var notFound = 'Неизвестный штрих-код';

          _.each(sbs, function (sb) {

            $scope.$broadcast ('stockBatchBarCodeScan',{
              stockBatch: sb,
              code: code
            });

            notFound = false;
          });

          if (notFound) {
            SoundSynth.say(notFound);
          }

        }).catch(Errors.ru.add);

      }

      BarCodeScanner.bind(scanFn);
      vm.onBarCode = scanFn;

      $scope.$on('$stateChangeSuccess', function (e, to) {
        vm.hideBottomBar = !! _.get(to, 'data.hideBottomBar');
      });


    })
  ;

}());
