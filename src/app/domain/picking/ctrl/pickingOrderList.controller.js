'use strict';

(function () {

  angular.module('webPage')
    .controller('PickingOrderListController', function ($scope, Schema, $state, Errors, BarCodeScanner, SoundSynth, Sockets) {

      var picker = Schema.model ('Picker').getCurrent();

      if (!picker) {
        return $state.go ('login');
      }

      var vm = this;
      var PO = Schema.model ('PickingOrder');
      var POP = Schema.model ('PickingOrderPosition');
      var SB = Schema.model ('StockBatch');

      var onJSData = function (event) {
        if (event.resource === 'dev/PickingRequest') {
          refresh();
        }
      };

      function setSelected () {
        vm.selectedItems = PO.filter({
          picker: picker.id,
          selected: true
        });
        vm.hasSelected = !!vm.selectedItems.length;
      }

      $scope.$on('$destroy',Sockets.on('jsData:update', onJSData));

      function refresh() {
        var lastModified = PO.lastModified();
        vm.busy = PO.findAll({picker: picker.id}, {bypassCache: true})
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

            setSelected();

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

      $scope.$on('$destroy',PO.bindAll({
        picker: picker.id
      }, $scope, 'vm.pickingOrders'));

      $scope.$on('$destroy',PO.bindAll({
        picker: picker.id,
        selected: true
      }, $scope, 'vm.selectedItems'));

      angular.extend(vm, {

        toggleSelect: function (item) {
          item.selected = !item.selected;
          setSelected();
        },

        rowClass: function (order) {
          return (order.selected ? 'active ' : '') + order.cls;
        },

        totals: PO.agg (vm, 'pickingOrders'),
        selectedTotals: PO.agg (vm, 'selectedItems'),

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

      $scope.$on('$stateChangeSuccess', function (e, to) {
        vm.hideBottomBar = !! _.get(to, 'data.hideBottomBar');
      });

      $scope.$on('$stateChangeSuccess', function (e, to) {
        vm.onBarCode = _.get(to, 'data.needBarcode') && scanFn;
        if (to.name === 'picking.orderList') {
          setSelected();
        }
      });

      $scope.$watch('vm.hasSelected',function (n){
        vm.currentTotals = n ? vm.selectedTotals : vm.totals;
      });

    })
  ;

}());
