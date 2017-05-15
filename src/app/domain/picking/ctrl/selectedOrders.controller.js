'use strict';

(function () {

  angular.module('webPage')
    .controller('SelectedOrdersController', function (Schema, $scope, $state, saAsync, WeighingService, ConfirmModal, $q) {

      const PO = Schema.model('PickingOrder');
      const POP = Schema.model('PickingOrderPosition');
      let vm = this;

      function ejectOthers () {
        Schema.model ('PickingOrderPositionPicked').ejectAll();
        Schema.model ('StockBatch').ejectAll();
      }

      let selected = $scope.$parent.vm.pickingItems || $scope.$parent.vm.selectedItems;

      function loadRelationsPOP (pop) {
        return POP.loadRelations(pop,['PickingOrderPositionPicked']);
      }

      let allPositions = [];

      _.each(selected, po => {
        Array.prototype.push.apply(allPositions,po.positions);
      });

      let progress = {
        max: allPositions.length,
        value: 0
      };

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

          // have to show spinner while weighing

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

      angular.extend(vm,{

        progress: progress,

        selectedItems: selected,
        totals: PO.agg (vm, 'selectedItems'),

        startPicking: () => {

          // here we have to ask for weight and start pickingSession

          weighing()
            .then((weight) => {

              console.info('startPicking weighing success', weight);

              vm.selectedItems = _.map(vm.selectedItems, po => {
                po.processing = 'picking';
                PO.save(po);
                return po;
              });
              $scope.$parent.vm.pickingItems = vm.selectedItems;
              $state.go('^.articleList');

            })
            .catch((err) => {
              console.info('startPicking weighing problem', err);
            });

        },

        finishPicking: () => {

          // here we have to ask for weight and finish pickingSession

          _.each(vm.selectedItems, po => {
            po.processing = 'picked';
            po.selected = undefined;
            PO.save(po);
          });
          $scope.$parent.vm.pickingItems = false;
          ejectOthers();
          $state.go('^');
        },

        pausePicking: () => {

          // here we have to ask for weight and finish pickingSession

          _.each(vm.selectedItems, po => {
            po.processing = 'ready';
            po.selected = undefined;
            PO.save(po);
          });
          $scope.$parent.vm.pickingItems = false;
          ejectOthers();
          $state.go('^');
        }

      });

      vm.busy = saAsync.chunkSerial (4, allPositions, loadRelationsPOP, chunk => {
        progress.value += chunk.length;
      }, _.noop);

      vm.busy.then(() => {
        vm.progress = false;
      });

    })
  ;

}());
