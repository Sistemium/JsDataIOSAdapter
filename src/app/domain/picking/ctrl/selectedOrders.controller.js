'use strict';

(function () {

  angular.module('webPage')
    .controller('SelectedOrdersController', function (Schema, $scope, $state, saAsync, WeighingService, ConfirmModal) {

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

        weighingModalWithText('Взвесить тележку?')
          .then((data) => {
            console.info('111 then', data);
          })
          .catch((data) => {
            console.info('111 catch', data);
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

            if (!err || !err.status) return err;
            return weighingError();

          })
        ;

      }

      function weighingError() {
        return weighingModalWithText('Ошибка взвешивания. Повторить?');
      }

      angular.extend(vm,{

        progress: progress,

        selectedItems: selected,
        totals: PO.agg (vm, 'selectedItems'),

        startPicking: () => {

          // here we have to ask for weight and start pickingSession

          weighing();

          //   vm.selectedItems = _.map(vm.selectedItems, po => {
          //     po.processing = 'picking';
          //     PO.save(po);
          //     return po;
          //   });
          //   $scope.$parent.vm.pickingItems = vm.selectedItems;
          //   $state.go('^.articleList');

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
