(function () {

  angular.module('webPage')
    .controller('PickedPositionController', PickedPositionController);

  const WAREHOUSE_OLD_MARK_SCAN_EVENT = 'warehouseOldMarkScan';

  function PickedPositionController($scope, $state, models, Picking) {

    const vm = this;
    const { PickingOrderPosition, PickingOrderPositionPicked } = models;

    const mode = $state.params.positionId ? 'pick' : 'picked';

    let pickedPosition = mode === 'picked'
      && PickingOrderPositionPicked.get($state.params.pickedPositionId);

    const position = pickedPosition && pickedPosition.parent
      || PickingOrderPosition.get($state.params.positionId);

    let initVolume, initExport;

    let unPickedVolume;

    if (pickedPosition) {
      initVolume = pickedPosition.boxPcs().full;
      initExport = pickedPosition.volume;
      unPickedVolume = position.unPickedVolume() + initExport;
    } else if (position) {
      initVolume = position.unPickedBoxPcs().full;
      initExport = position.unPickedVolume();
      unPickedVolume = position.unPickedVolume();
    }

    const states = [
      {
        input: 'volume',
        label: 'Собрано',
        validate: val => {
          return !!parseInt(val) && (parseInt(val) <= unPickedVolume);
        },
        value: initVolume,
        exportValue: initExport
      }
    ];

    const barCode = pickedPosition && pickedPosition.code;

    if (barCode) {

      vm.barCode = barCode;

    } else if (position && position.Article.productionInfoType) {
      states.push({
        input: 'productionInfo',
        label: 'Дата розлива',
        datatype: 'date',
        validate: val => {
          return !!/\d{2}\/\d{2}\/\d{2,4}/.test(val);
        },
        value: pickedPosition && pickedPosition.productionInfo || ''
      });
    }

    if (position) {
      states.push({
        input: 'code',
        label: 'Марка',
        datatype: false,
        value: pickedPosition && pickedPosition.code || '',
        validate(val) {
          return !!val;
        },
      });
    }

    angular.extend(vm, {

      position: position,
      pickedPosition: pickedPosition,
      states: states,
      step: pickedPosition ? undefined : 0,

      $onInit() {
        $scope.$on(WAREHOUSE_OLD_MARK_SCAN_EVENT, (e, { code }) => onScan({ code }));
      },

      currentStep() {
        return states[vm.step];
      },

      notDone() {

        const step = this.currentStep();

        if (!step) {
          return false;
        }

        return !step.validate(step.value);

      },

      done() {

        if (angular.isUndefined(vm.step)) {
          return vm.save();
        }

        if (!pickedPosition) {
          if (vm.step + 1 === states.length) {
            return vm.save();
          } else {
            vm.step++;
          }
        } else {
          vm.step = undefined;
        }

      },

      edit(step) {

        vm.step = step;

      },

      save() {

        const volume = states[0].exportValue;
        const productionInfo = states.length > 2 ? states[1].value : null;
        const code = states.length > 2 ? states[2].code : null;
        let q;

        if (!pickedPosition) {
          q = PickingOrderPositionPicked.create({
            pickingOrderPositionId: position.id,
            volume,
            productionInfo,
            articleId: position.articleId,
            code,
          });
        } else {
          _.assign(pickedPosition, { volume, productionInfo, code });
          q = PickingOrderPositionPicked.save(pickedPosition.id);
        }

        q.then(() => {
          $state.go('^');
        })

      },

      remove() {
        pickedPosition.DSDestroy()
          .then(() => pickedPosition.unlinkWarehouseBox())
          .then(() => {
            $state.go('^');
          });
      },

    });

    function onScan({ code }) {

      console.info(vm.step, code);

      const step = vm.currentStep();

      if (!step) {
        return;
      }

      if (step.input === 'code') {
        step.value = `🏷 ${code.slice(0, 10)}`;
        step.code = code;
        Picking.say('Марка принята');
      }

    }

  }

})();
