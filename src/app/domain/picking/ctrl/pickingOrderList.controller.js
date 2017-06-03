'use strict';

(function () {

  angular.module('webPage')
    .controller('PickingOrderListController', ctrl)
  ;

  function ctrl ($scope, Schema, $state, Errors, BarCodeScanner, SoundSynth, Sockets, saAsync, DEBUG) {

    var picker = Schema.model ('Picker').getCurrent();

    if (!picker) {
      return $state.go ('login');
    }

    var date;
    var stateFilterYes = {
      picker: picker.id
    };

    var stateFilterNo = {
      processing: false
    };

    if ($state.params.state === 'done') {
      stateFilterYes.processing = 'picked';
    } else {
      stateFilterNo.processing = 'picked';
    }

    var vm = this;
    var PO = Schema.model ('PickingOrder');
    var POP = Schema.model ('PickingOrderPosition');
    var SB = Schema.model ('StockBatch');

    function onFindPO (data) {
      var i = (data && data.length) ? data[0] : data;
      if (_.matches(stateFilterYes)(i) && !_.matches(stateFilterNo)(i)) {
        PO.inject(i);
        return POP.findAllWithRelations({ pickingOrder: i.id })('Article')
      } else {
        PO.eject(i.id);
        return false;
      }
    }

    var onJSData = function (event) {
      var id = _.get(event, 'data.id');
      if (!id) {
        return;
      }
      if (event.resource === 'PickingOrder') {
        PO.find(id, {bypassCache: true, cacheResponse: false})
          .then(onFindPO)
          .catch (function (err) {
            if (err.error === 404) {
              DEBUG ('PickingOrderListController:eject',id);
              PO.eject (id);
            }
          });
      } else if (event.resource === 'PickingOrderPosition') {
        POP.find(id, {cacheResponse: false})
          .then(function(pos){
            if (PO.get(pos.pickingOrder)) {
              POP.inject(pos);
              POP.loadRelations(pos, ['Article', 'PickingOrderPositionPicked']);
            }
          });
      }
    };

    function setSelected () {
      vm.selectedItems = PO.filter({
        picker: picker.id,
        date: date,
        selected: true
      });
      vm.hasSelected = !!vm.selectedItems.length;
    }

    $scope.$on('$destroy',Sockets.jsDataSubscribe(['PickingOrder','PickingOrderPosition']));
    $scope.$on('$destroy',Sockets.onJsData('jsData:update', onJSData));

    PO.ejectAll();
    POP.ejectAll();

    function refresh() {

      var lastModified = PO.lastModified();

      vm.busy = PO.findAll({
          picker: picker.id,
          date: date
        }, {bypassCache: true, cacheResponse: false})
        .then(function (res) {

          var progress = {
            max: res.length,
            value: 0
          };

          vm.progress = progress;

          saAsync.series(_.map(res,function(po){
            return function(done) {
              var res = onFindPO(po);

              if (res) {
                res.then(function(){
                  progress.value ++;
                  done();
                });
              } else {
                progress.value ++;
                done();
              }

            };
          }),function () {
            vm.progress = false;
            if (!lastModified) {
              return;
            }
            _.each (res, function (po) {
              if (po.DSLastModified() <= lastModified) {
                PO.eject(po);
              }
            });
          });

          if (!vm.selectedItems.length && vm.mode !== 'orderList') {
            $state.go('picking.orderList',{state: 'notdone'});
          }

          setSelected();

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
      hasSelected: false,

      refresh: refresh

    });

    Schema.model('Setting').findAll({
      group: 'domain',
      name: 'picking.date'
    }).then (function(res){
      if (res.length) {
        date = res[0].value;
      } else {
        date = null;
      }
      refresh();
    });

    function scanFn(code, type, object) {

      var notFound = 'Неизвестный штрих-код';

      Errors.clear();
      code = code || vm.barCodeInput;

      var q;

      if (object) {
        SB.inject(object);
        //toastr.info (object.id,'scanFn object.id');
        q = SB.find(object.id);
      } else if (vm.barCodeInput) {
        q = SB.someBy.barCode(code).then(function (sbs) {
          return _.head(sbs);
        });
      } else {
        return SoundSynth.say(notFound);
      }

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

    BarCodeScanner.bind(scanFn, SoundSynth.repeat);

    $scope.$on('$stateChangeSuccess', function (e, to) {
      vm.hideBottomBar = !! _.get(to, 'data.hideBottomBar');
      vm.mode = to.name.match(/[^\.]*$/)[0];
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

  }

})();
