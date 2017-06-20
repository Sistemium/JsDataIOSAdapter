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
      pausePicking,
      getWeighing,

      shouldWeighing: WeighingService.shouldWeighing

    });

    function ejectOthers () {
      Schema.model ('PickingOrderPositionPicked').ejectAll();
      Schema.model ('StockBatch').ejectAll();
    }

    function loadRelationsPOP (pop) {
      return POP.loadRelations(pop,['PickingOrderPositionPicked']);
    }

    function weighing() {

      if (!vm.shouldWeighing()) return $q.resolve(-1);

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
          return getWeight();
        })
        .catch(err => {

          if (!err || !err.status) return $q.reject(err);
          return weighingError();

        })
      ;

    }

    function getWeighing() {

      return getWeight()
        .then((weight) => {
          createPickingSessionWeighing(weight);
        })
      ;

    }

    function getWeight() {

      //TODO: have to show spinner while weighing

      return WeighingService.weighing()
        .then((response) => {

          if (response.status !== 200) {
            return weighingError();
          }

          return confirmWeighingModal(response.data.weight);

        })
      ;

    }

    function confirmWeighingModal(weight) {

      return ConfirmModal.show({
        text: `Вес: ${weight} кг. Записать?`
      })
        .then(() => {
          return weight;
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
      PS.findAll({
        pickerId: picker.id,
        siteId: picker.siteId,
        processing: 'picking'
      }, { bypassCache: true })
        .then(pss => {
          vm.pickingSession = _.first(pss);
        })
      ;
    }

    function createPickingSession(weight) {

      vm.pickingSession = PS.inject({
        processing: 'picking',
        pickerId: picker.id,
        siteId: picker.siteId
      });

      PS.save(vm.pickingSession)
        .then(() => {

          createPickingSessionWeighing(weight);

          _.forEach(vm.selectedItems, po => {
            POS.save(
              POS.inject({
                pickingSessionId: vm.pickingSession.id,
                pickingOrderId: po.id
              })
            );
          });

        })
        .then(() => {

          $scope.$parent.vm.pickingItems = vm.selectedItems;
          $state.go('^.articleList');

        })
      ;

    }

    function createPickingSessionWeighing(weight) {

      if (vm.shouldWeighing()) {

        PSW.save(
          PSW.inject({
            pickingSessionId: vm.pickingSession.id,
            weight: weight
          })
        );

      }

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

          vm.selectedItems = _.map(vm.selectedItems, po => {
            po.processing = 'picking';
            PO.save(po);
            return po;
          });

          console.info('weighing success', weight);
          createPickingSession(weight);

        })
        .catch((err) => {
          console.info('weighing problem', err);
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

          createPickingSessionWeighing(weight);
          selectedItemProcessing(processing);

        })
        .catch((err) => {
          console.info('weighing problem', err);
        })
      ;
    }

    vm.busy = saAsync.chunkSerial (4, allPositions, loadRelationsPOP, chunk => {
      progress.value += chunk.length;
    }, _.noop)
      .then(getCurrentPickingSession());

    vm.busy.then(() => {
      vm.progress = false;
    });

  }

  angular.module('webPage')
    .controller('SelectedOrdersController', SelectedOrdersController);

})();
