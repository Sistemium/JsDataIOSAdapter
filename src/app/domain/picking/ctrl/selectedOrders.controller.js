'use strict';

(function () {

  function SelectedOrdersController(Schema, $scope, $state, saAsync, WeighingService, ConfirmModal, $q) {

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
      pickingSession: currentSession(),

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
      ejectOthers();
      $state.go('^');

    }

    function currentSession() {
      PS.findAll({processing: 'startPicking'}).then(ps => {
        return ps;
      });
    }

    function startPicking() {

      if (vm.pickingSession) {

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
              processing: 'startPicking'
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

          $scope.$parent.vm.pickingItems = vm.selectedItems;

          PS.save(vm.pickingSession).then(() => {
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
      weighing()
        .then((weight) => {

          console.info('finishPicking weighing success', weight);
          selectedItemProcessing('picked');

        })
        .catch((err) => {
          console.info('finishPicking weighing problem', err);
        })
      ;

    }

    function pausePicking() {

      // here we have to ask for weight and finish pickingSession

      weighing()
        .then((weight) => {

          console.info('pausePicking weighing success', weight);
          selectedItemProcessing('ready');

        })
        .catch((err) => {
          console.info('pausePicking weighing problem', err);
        })
      ;

    }

    vm.busy = saAsync.chunkSerial (4, allPositions, loadRelationsPOP, chunk => {
      progress.value += chunk.length;
    }, _.noop);

    vm.busy.then(() => {
      vm.progress = false;
    });

  }

  angular.module('webPage')
    .controller('SelectedOrdersController', SelectedOrdersController);

}());
