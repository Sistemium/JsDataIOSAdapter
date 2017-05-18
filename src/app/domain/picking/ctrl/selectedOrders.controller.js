'use strict';

(function () {

  function SelectedOrdersController(Schema, $scope, $state, saAsync, WeighingService, ConfirmModal, $q) {

    const picker = Schema.model('Picker').getCurrent();

    if (!picker) {
      return $state.go ('login');
    }

    const PO = Schema.model('PickingOrder');
    const POP = Schema.model('PickingOrderPosition');
    const POS = Schema.model('PickingOrderSession');
    const PS = Schema.model('PickingSession');
    const PSW = Schema.model('PickingSessionWeighing');

    let vm = this;

    let selected = $scope.$parent.vm.pickingItems || $scope.$parent.vm.selectedItems;

    let allPositions = [];

    _.each(selected, po => {
      Array.prototype.push.apply(allPositions,po.positions);
    });

    let progress = {
      max: allPositions.length,
      value: 0
    };

    angular.extend(vm,{

      progress: progress,

      selectedItems: selected,
      totals: PO.agg (vm, 'selectedItems'),

      startPicking,
      finishPicking,
      pausePicking

    });

    function ejectOthers () {
      Schema.model ('PickingOrderPositionPicked').ejectAll();
      Schema.model ('StockBatch').ejectAll();
    }

    function loadRelationsPOP (pop) {
      return POP.loadRelations(pop,['PickingOrderPositionPicked']);
    }

    function weighing() {

      return weighingModalWithText('Взвесить тележку?')
        .then((data) => {
          return data;
        })
        .catch((err) => {
          return $q.reject(err);
        })
        ;

    }

    function weighingModalWithText(text) {

      return ConfirmModal.show({
        text: text
      })
        .then(() => {

          //TODO: have to show spinner while weighing

          return WeighingService.weighing()
            .then((response) => {

              if (response.status !== 200) {
                return weighingError();
              }

              return response.data.weight;

            })
            ;

        })
        .catch(err => {

          if (!err || !err.status) return $q.reject(err);
          return weighingError();

        })
        ;

    }

    function weighingError() {
      return weighingModalWithText('Ошибка взвешивания. Повторить?');
    }

    function selectedItemProcessing(processing) {

      _.each(vm.selectedItems, po => {
        po.processing = processing;
        po.selected = undefined;
        PO.save(po);
      });
      $scope.$parent.vm.pickingItems = false;

      if (vm.pickingSession) {

        vm.pickingSession.processing = 'finished';
        PS.save(vm.pickingSession);
        vm.pickingSession = undefined;

      }

      ejectOthers();
      $state.go('^');

    }

    function getCurrentPickingSession() {
      PS.findAll({processing: 'picking'}, { bypassCache: true })
        .then(pss => {
          vm.pickingSession = _.first(pss);
        })
      ;
    }

    function startPicking() {

      if (vm.pickingSession) {

        $scope.$parent.vm.pickingItems = vm.selectedItems;
        $state.go('^.articleList');
        return;

      }

      // here we have to ask for weight and start pickingSession

      weighing()
        .then((weight) => {

          console.info('startPicking weighing success', weight);

          vm.selectedItems = _.map(vm.selectedItems, po => {
            po.processing = 'picking';
            PO.save(po);
            return po;
          });

          console.info('vm.pickingSession',
            vm.pickingSession = PS.inject({
              processing: 'picking',
              pickerId: picker.id,
              siteId: picker.siteId
            })
          );
          console.info('pickingSessionWeighing',
            PSW.inject({
              pickingSessionId: vm.pickingSession.id,
              weight: weight
            })
          );

          _.forEach(vm.selectedItems, po => {
            console.info(
              POS.inject({
                pickingSessionId: vm.pickingSession.id,
                pickingOrderId: po.id
              })
            );
          });

          PS.save(vm.pickingSession).then(() => {

            $scope.$parent.vm.pickingItems = vm.selectedItems;
            $state.go('^.articleList');

          });

        })
        .catch((err) => {
          console.info('startPicking weighing problem', err);
        })
      ;

    }

    function finishPicking() {

      // here we have to ask for weight and finish pickingSession
      endPicking('picked');

    }

    function pausePicking() {

      // here we have to ask for weight and finish pickingSession
      endPicking('ready');

    }

    function endPicking(processing) {

      if (!vm.pickingSession) {

        selectedItemProcessing(processing);
        return;

      }

      weighing()
        .then((weight) => {

          console.info('weighing success', weight);

          console.info('pickingSessionWeighing',
            PSW.inject({
              pickingSessionId: vm.pickingSession.id,
              weight: weight
            })
          );

          selectedItemProcessing(processing);

        })
        .catch((err) => {
          console.info('weighing problem', err);
        })
      ;
    }

    vm.busy = saAsync.chunkSerial (4, allPositions, loadRelationsPOP, getCurrentPickingSession, chunk => {
      progress.value += chunk.length;
    }, _.noop);

    vm.busy.then(() => {
      vm.progress = false;
    });

  }

  angular.module('webPage')
    .controller('SelectedOrdersController', SelectedOrdersController);

}());
