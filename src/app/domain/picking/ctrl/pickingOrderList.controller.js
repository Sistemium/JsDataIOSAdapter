'use strict';

(function () {

  angular.module('webPage')
    .controller('PickingOrderListController', ctrl)
  ;

  function ctrl ($scope, Schema, $state, Errors, BarCodeScanner, SoundSynth, Sockets, saAsync, DEBUG) {

    const picker = Schema.model ('Picker').getCurrent();

    if (!picker) {
      return $state.go ('login');
    }

    let date;
    let stateFilterYes = {
      pickerId: picker.id
    };

    let stateFilterNo = {
      processing: false
    };

    if ($state.params.state === 'done') {
      stateFilterYes.processing = 'picked';
    } else {
      stateFilterNo.processing = 'picked';
    }

    let vm = this;
    const PO = Schema.model ('PickingOrder');
    const POP = Schema.model ('PickingOrderPosition');
    const SB = Schema.model ('StockBatch');

    function onFindPO (data) {
      const i = (data && data.length) ? data[0] : data;
      if (_.matches(stateFilterYes)(i) && !_.matches(stateFilterNo)(i)) {
        PO.inject(i);
        return POP.findAllWithRelations({ pickingOrderId: i.id })('Article')
      } else {
        PO.eject(i.id);
        return false;
      }
    }

    const onJSData = event => {
      const id = _.get(event, 'data.id');
      if (!id) {
        return;
      }
      if (event.resource === 'PickingOrder') {
        PO.find(id, {bypassCache: true, cacheResponse: false})
          .then(onFindPO)
          .catch (err => {
            if (err.error === 404) {
              DEBUG ('PickingOrderListController:eject',id);
              PO.eject (id);
            }
          });
      } else if (event.resource === 'PickingOrderPosition') {
        POP.find(id, {cacheResponse: false})
          .then(pos => {
            if (PO.get(pos.pickingOrderId)) {
              POP.inject(pos);
              POP.loadRelations(pos, ['Article', 'PickingOrderPositionPicked']);
            }
          });
      }
    };

    function setSelected () {
      vm.selectedItems = PO.filter({
        pickerId: picker.id,
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

      const lastModified = PO.lastModified();

      vm.busy = PO.findAll({
          pickerId: picker.id,
          date: date
        }, {bypassCache: true, cacheResponse: false})
        .then(res => {

          let progress = {
            max: res.length,
            value: 0
          };

          vm.progress = progress;

          saAsync.series(_.map(res, po => {
            return done => {
              const res = onFindPO(po);

              if (res) {
                res.then(() => {
                  progress.value ++;
                  done();
                });
              } else {
                progress.value ++;
                done();
              }

            };
          }), () => {
            vm.progress = false;
            if (!lastModified) {
              return;
            }
            _.each (res, po => {
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
      pickerId: picker.id
    }, $scope, 'vm.pickingOrders'));

    $scope.$on('$destroy',PO.bindAll({
      pickerId: picker.id,
      selected: true
    }, $scope, 'vm.selectedItems'));

    angular.extend(vm, {

      toggleSelect: item => {
        item.selected = !item.selected;
        setSelected();
      },

      rowClass: order => {
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
    }).then (res => {
      if (res.length) {
        date = res[0].value;
      } else {
        date = null;
      }
      refresh();
    });

    function scanFn(code, type, object) {

      const notFound = 'Неизвестный штрих-код';

      Errors.clear();
      code = code || vm.barCodeInput;

      let q;

      if (object) {
        SB.inject(object);
        //toastr.info (object.id,'scanFn object.id');
        q = SB.find(object.id);
      } else if (vm.barCodeInput) {
        q = SB.someBy.barCode(code).then(sbs => {
          return _.head(sbs);
        });
      } else {
        return SoundSynth.say(notFound);
      }

      q.then(sb => {
        if (!sb) {
          return SoundSynth.say(notFound);
        }
        $scope.$broadcast ('stockBatchBarCodeScan',{
          stockBatch: sb,
          code: code
        });
      }, () => {
        SoundSynth.say(notFound);
      });

    }

    BarCodeScanner.bind(scanFn, SoundSynth.repeat);

    $scope.$on('$stateChangeSuccess', (e, to) => {
      vm.hideBottomBar = !! _.get(to, 'data.hideBottomBar');
      vm.mode = to.name.match(/[^\.]*$/)[0];
      vm.onBarCode = _.get(to, 'data.needBarcode') && scanFn;
      if (to.name === 'picking.orderList') {
        setSelected();
      }
    });

    $scope.$watch('vm.hasSelected', n => {
      vm.currentTotals = n ? vm.selectedTotals : vm.totals;
    });

  }

}());
