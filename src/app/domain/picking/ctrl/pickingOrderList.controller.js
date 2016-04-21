'use strict';

(function () {

  angular.module('webPage')
    .controller('PickingOrderListController', function ($scope, Schema, $state, Errors, BarCodeScanner, SoundSynth, Sockets, DEBUG) {

      var picker = Schema.model ('Picker').getCurrent();

      if (!picker) {
        return $state.go ('login');
      }

      var vm = this;
      var PO = Schema.model ('PickingOrder');
      var POP = Schema.model ('PickingOrderPosition');
      var SB = Schema.model ('StockBatch');

      function onFindPO (i) {
        return PO.loadRelations(i).then(function (r) {
          _.each(r.positions, function (pos) {
            POP.loadRelations(pos, ['Outlet','Article', 'PickingOrderPositionPicked']);
          });
        });
      }

      var onJSData = function (event) {
        if (event.resource === 'dev/PickingOrder') {
          var id = _.get(event, 'data.id');
          if (id) {
            PO.find(event.data.id, {bypassCache: true})
              .then(onFindPO)
              .catch (function (err) {
                if (err.error === 404) {
                  DEBUG ('PickingOrderListController:eject',id);
                  PO.eject (id);
                }
              });
          }
        }
      };

      function setSelected () {
        vm.selectedItems = PO.filter({
          picker: picker.id,
          selected: true
        });
        vm.hasSelected = !!vm.selectedItems.length;
      }

      $scope.$on('$destroy',Sockets.jsDataSubscribe(['dev/PickingOrder']));
      $scope.$on('$destroy',Sockets.on('jsData:update', onJSData));

      function refresh() {
        var lastModified = PO.lastModified();
        vm.busy = PO.findAll({picker: picker.id}, {bypassCache: true})
          .then(function (res) {

            res.forEach(onFindPO);

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
              if (po.DSLastModified() <= lastModified) {
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

      function scanFn(code,type,object) {

        Errors.clear();

        code = code || vm.barCodeInput;

        var q;

        if (object) {
          SB.inject(object);
          //toastr.info (object.id,'scanFn object.id');
          q = SB.find(object.id);
        } else {
          q = SB.someBy.barCode(code).then(function (sbs) {
            return _.head(sbs);
          });
        }

        var notFound = 'Неизвестный штрих-код';

        q.then(function(sb){
          if (!sb) {
            return SoundSynth.say(notFound);
          }
          $scope.$broadcast ('stockBatchBarCodeScan',{
            stockBatch: sb,
            code: code
          });
        },function (){
          SoundSynth.say(notFound);
        });

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
