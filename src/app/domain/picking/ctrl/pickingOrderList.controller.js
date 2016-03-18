'use strict';

(function () {

  angular.module('webPage')
    .controller('PickingOrderListController', function ($scope, models, $state, toastr, Errors, BarCodeScanner, SoundSynth) {

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
              POP.loadRelations (pos,['Article','PickingOrderPositionPicked']);
            });
          });
        });

        if (!vm.selectedItems.length) {
          $state.go ('picking.orderList');
        }

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


      function scanFn(code) {

        Errors.clear();

        code = code || vm.barCodeInput;

        return models.StockBatch.someBy.barCode(code).then(function (sbs) {

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
