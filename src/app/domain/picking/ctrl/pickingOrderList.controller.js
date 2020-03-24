'use strict';

(function () {

  const WAREHOUSE_BOX_SCAN_EVENT = 'warehouseBoxBarCodeScan';
  const WAREHOUSE_PALETTE_SCAN_EVENT = 'warehousePaletteBarCodeScan';
  const WAREHOUSE_ITEM_SCAN_EVENT = 'warehouseItemBarCodeScan';
  const WAREHOUSE_OLD_MARK_SCAN_EVENT = 'warehouseOldMarkScan';
  const STOCK_BATCH_SCAN_EVENT = 'stockBatchBarCodeScan';
  const EXCISE_STAMP_LENGTH = 68;

  function PickingOrderListController($scope, Schema, $state, Errors,
                                      BarCodeScanner, SoundSynth, Sockets,
                                      saAsync, DEBUG, IOS, Picking) {

    const picker = Schema.model('Picker').getCurrent();

    const PO = Schema.model('PickingOrder');
    const POP = Schema.model('PickingOrderPosition');
    const SB = Schema.model('StockBatch');

    const PS = Schema.model('PickingSession');
    const POS = Schema.model('PickingOrderSession');

    const { BarCodeType } = Schema.models();

    const {
      BARCODE_TYPE_STOCK_BATCH,
      BARCODE_TYPE_WAREHOUSE_BOX,
      BARCODE_TYPE_EXCISE_STAMP,
      BARCODE_TYPE_WAREHOUSE_PALETTE,
    } = BarCodeType.meta.types;

    if (!picker) {
      return $state.go('login');
    }

    const stateFilterYes = {
      pickerId: picker.id
    };

    const stateFilterNo = {
      processing: false
    };

    if ($state.params.state === 'done') {
      stateFilterYes.processing = 'picked';
    } else {
      stateFilterNo.processing = 'picked';
    }

    let date;

    const vm = this;

    _.assign(vm, {

      toggleSelect: item => {
        item.selected = !item.selected;
        setSelected();
      },

      rowClass: order => {
        return (order.selected ? 'active ' : '') + order.cls;
      },

      isIos: IOS.isIos(),
      totals: PO.agg(vm, 'pickingOrders'),
      selectedTotals: PO.agg(vm, 'selectedItems'),
      hasSelected: false,

      refresh: refresh

    });

    BarCodeScanner.bind(scanFn, SoundSynth.repeat);

    $scope.$on('$destroy', PO.bindAll({
      pickerId: picker.id
    }, $scope, 'vm.pickingOrders'));

    $scope.$on('$destroy', PO.bindAll({
      pickerId: picker.id,
      selected: true
    }, $scope, 'vm.selectedItems'));

    $scope.$on('$stateChangeSuccess', (e, to) => {
      vm.hideBottomBar = !!_.get(to, 'data.hideBottomBar');
      vm.mode = to.name.match(/[^.]*$/)[0];
      vm.onBarCode = _.get(to, 'data.needBarcode') && scanFn;
      if (to.name === 'picking.orderList') {
        setSelected();
      }
    });

    $scope.$watch('vm.hasSelected', n => {
      vm.currentTotals = n ? vm.selectedTotals : vm.totals;
    });

    $scope.$on('$destroy', Sockets.jsDataSubscribe(['PickingOrder', 'PickingOrderPosition']));
    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

    PO.ejectAll();
    POP.ejectAll();


    Schema.model('Setting').findAll({
      group: 'domain',
      name: 'picking.date'
    }).then(res => {
      if (res.length) {
        date = res[0].value;
      } else {
        date = null;
      }
      refresh();
    });


    /*
     Functions
     */

    function findUnfinishedPickingSession() {

      PS.findAll({
        pickerId: picker.id,
        siteId: picker.siteId,
        processing: 'picking'
      }, { bypassCache: true })
        .then(pss => {

          let ps = _.first(pss);

          if (!ps) {

            if ($state.current.name !== 'picking.orderList') {
              $state.go('picking.orderList', { state: 'notdone' }, { reload: true });
            }
            return;
          }

          POS.findAll({ pickingSessionId: ps.id })
            .then(pickingOrderSessions => {

              let poIds = _.uniq(_.map(pickingOrderSessions, 'pickingOrderId'));

              PO.findAll({
                pickerId: picker.id,
                date: date
              }, { bypassCache: true, cacheResponse: false })
                .then(() => {

                  vm.selectedItems = PO.getAll(poIds);
                  vm.hasSelected = !!vm.selectedItems.length;

                  _.each(vm.selectedItems, po => po.selected = true);

                  if (vm.hasSelected) {

                    if (!_.endsWith($state.current.name, 'selectedOrders')) {
                      $state.go('picking.orderList.selectedOrders');
                    } else {
                      // $state.go('^');
                    }
                  } else {
                    $state.go('picking.orderList', { state: 'notdone' });
                  }

                });

            });

        });

    }

    function onFindPO(data) {

      const i = (data && data.length) ? data[0] : data;

      if (_.matches(stateFilterYes)(i) && !_.matches(stateFilterNo)(i)) {
        PO.inject(i);
        return POP.etc.findAllWithArticles({ pickingOrderId: i.id });
      } else {
        PO.eject(i.id);
        return false;
      }

    }

    function onJSData(event) {

      const id = _.get(event, 'data.id');

      if (!id) {
        return;
      }

      if (event.resource === 'PickingOrder') {

        PO.find(id, { bypassCache: true, cacheResponse: false })
          .then(onFindPO)
          .catch(err => {
            if (err.error === 404) {
              DEBUG('PickingOrderListController:eject', id);
              PO.eject(id);
            }
          });

      } else if (event.resource === 'PickingOrderPosition') {

        POP.find(id, { cacheResponse: false })
          .then(pos => {
            if (PO.get(pos.pickingOrderId)) {
              POP.inject(pos);
              POP.loadRelations(pos, ['Article', 'PickingOrderPositionPicked']);
            }
          });

      }
    }

    function setSelected() {
      vm.selectedItems = PO.filter({
        pickerId: picker.id,
        date: date,
        selected: true
      });
      vm.hasSelected = !!vm.selectedItems.length;
    }

    function refresh() {

      const lastModified = PO.lastModified();

      vm.busy = PO.findAll({
        pickerId: picker.id,
        date: date
      }, { bypassCache: true, cacheResponse: false })
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
                  progress.value++;
                  done();
                });
              } else {
                progress.value++;
                done();
              }

            };
          }), () => {

            vm.progress = false;

            if (!lastModified) {
              return;
            }

            _.each(res, po => {
              if (po.DSLastModified() <= lastModified) {
                PO.eject(po);
              }
            });

            setSelected();

            if (!vm.selectedItems.length) {
              findUnfinishedPickingSession();
            }

          });

        });
    }

    function isOldMark(code) {
      return code.length === EXCISE_STAMP_LENGTH && $state.current.name.match(/pickedPosition/);
    }

    function scanFn(scanedCode, type, object) {

      const notFound = 'Неизвестный штрих-код';

      Errors.clear();

      const code = Picking.codabarFix(scanedCode || vm.barCodeInput);
      const codeType = Picking.scanType(code);

      if (codeType === BARCODE_TYPE_WAREHOUSE_BOX) {
        $scope.$broadcast(WAREHOUSE_BOX_SCAN_EVENT, { code });
        return;
      } else if (codeType === BARCODE_TYPE_EXCISE_STAMP) {
        const eventName = isOldMark(code) ? WAREHOUSE_OLD_MARK_SCAN_EVENT : WAREHOUSE_ITEM_SCAN_EVENT;
        $scope.$broadcast(eventName, { code });
        return;
      } else if (codeType === BARCODE_TYPE_WAREHOUSE_PALETTE) {
        $scope.$broadcast(WAREHOUSE_PALETTE_SCAN_EVENT, { code });
        return;
      }

      let q;

      if (object) {
        SB.inject(object);
        //toastr.info (object.id,'scanFn object.id');
        q = SB.find(object.id);
      } else if (vm.barCodeInput || codeType === BARCODE_TYPE_STOCK_BATCH) {
        q = Picking.stockBatchByBarCode(code);
      } else {
        return SoundSynth.say(notFound);
      }

      q.then(stockBatch => {

        if (!stockBatch) {
          return SoundSynth.say(notFound);
        }

        $scope.$broadcast(STOCK_BATCH_SCAN_EVENT, { stockBatch, code });

      })
        .catch(() => SoundSynth.say(notFound));

    }

  }

  angular.module('webPage')
    .controller('PickingOrderListController', PickingOrderListController);


})();
