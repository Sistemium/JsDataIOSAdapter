'use strict';

(function () {

  function PrePreOrderListController ($scope, Schema, $state, Sockets, saAsync, DEBUG) {

    var vm = this;
    var PO = Schema.model ('PrePreOrder');
    var POP = Schema.model ('PrePreOrderPosition');
    var SM = Schema.model ('Salesman');
    var stateFilter = {};

    vm.salesman = SM.getCurrent();

    vm.state = $state.params.state;

    if ($state.params.state) {
      stateFilter.processing = $state.params.state;
    }

    if (vm.salesman) {
      stateFilter.salesmanId = vm.salesman.id;
    }

    function onFindPO (data) {

      var i = _.first(data) || data;

      if (_.matches(stateFilter)(i)) {
        PO.inject(i);
        return PO.loadRelations(i,['Outlet', 'Salesman']).then(function (r) {
          saAsync.eachSeries(r.positions, function (pos,done) {
            POP.loadRelations(pos, ['Article'])
              .then(function(res){
                done(null,res);
              });
          });
        });
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
      if (event.resource === 'PrePreOrder') {
        PO.find(id, {bypassCache: true, cacheResponse: false})
          .then(onFindPO)
          .catch (function (err) {
            if (err.error === 404) {
              DEBUG ('PrePreOrderListController:eject',id);
              PO.eject (id);
            }
          });
      } else if (event.resource === 'PrePreOrderPosition') {
        POP.find(id, {cacheResponse: false})
          .then(function(pos){
            if (PO.get(pos.prePreOrder)) {
              POP.inject(pos);
              POP.loadRelations(pos, ['Article']);
            }
          });
      }
    };

    function setSelected () {
      vm.selectedItems = PO.filter(angular.extend({
        selected: true
      },stateFilter));
      vm.hasSelected = !!vm.selectedItems.length;
    }

    $scope.$on('$destroy',Sockets.jsDataSubscribe(['PrePreOrder','PrePreOrderPosition']));
    $scope.$on('$destroy',Sockets.onJsData('jsData:update', onJSData));

    function refresh() {

      vm.busy = PO.findAll(stateFilter, {bypassCache: true, cacheResponse: false, limit: 100})
        .then(function (res) {
          PO.ejectAll();
          POP.ejectAll();
          saAsync.chunkSerial(6,res,onFindPO)
            // .then(function(res){
            //   vm.data = res;
            // })
          ;
        });
    }

    $scope.$on('$destroy',
      PO.bindAll(stateFilter, $scope, 'vm.prePreOrders')
    );

    angular.extend(vm, {

      toggleSelect: function (item) {
        item.selected = !item.selected;
        setSelected();
      },

      rowClass: function (order) {
        return (order.selected ? 'active ' : '');
      },

      totals: PO.agg (vm, 'prePreOrders'),
      selectedTotals: PO.agg (vm, 'selectedItems'),
      hasSelected: false,

      refresh: refresh,
      stateFilter: stateFilter

    });

    vm.refresh();

    // $scope.$on('$stateChangeSuccess', function (e, to) {
    //   vm.hideBottomBar = !! _.get(to, 'data.hideBottomBar');
    //   vm.mode = to.name.match(/[^\.]*$/)[0];
    // });

    // $scope.$on('$stateChangeSuccess', function () {
    //   setSelected();
    // });

    // $scope.$watch('vm.hasSelected',function (n){
    //   vm.currentTotals = n ? vm.selectedTotals : vm.totals;
    // });

  }

  angular.module('webPage')
    .controller('PrePreOrderListController', PrePreOrderListController)
  ;
  
}());
