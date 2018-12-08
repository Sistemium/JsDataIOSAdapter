(function () {

  angular.module('webPage')
    .controller('PickedPositionController', PickedPositionController);

  function PickedPositionController($scope, $state, models) {

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
    } else if (position) {
      states.push({
        input: 'productionInfo',
        label: 'Марка',
        datatype: 'exciseStamp',
        validate: val => {
          return !!/^\d{3}-\d{8,9}/.test(val);
        },
        value: pickedPosition && pickedPosition.productionInfo || ''
      });
    }

    angular.extend(vm, {

      position: position,
      pickedPosition: pickedPosition,
      states: states,
      step: pickedPosition ? undefined : 0,

      notDone: () => {

        if (vm.step >= 0) {
          return !states [vm.step].validate(states [vm.step].value);
        }

      },

      done: () => {

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

      edit: step => {

        vm.step = step;

      },

      save: () => {

        if (!pickedPosition) {
          PickingOrderPositionPicked.create({
            pickingOrderPositionId: position.id,
            volume: states[0].exportValue,
            productionInfo: states.length > 1 ? states[1].value : null,
            articleId: position.articleId
          }).then(() => {
            $state.go('^');
          });
        } else {
          pickedPosition.volume = states[0].exportValue;
          pickedPosition.productionInfo = states.length > 1 ? states[1].value : null;
          PickingOrderPositionPicked.save(pickedPosition.id).then(() => {
            $state.go('^');
          });
        }

      },

      remove: () => {
        PickingOrderPositionPicked.destroy(pickedPosition).then(() => {
          $state.go('^');
        });
      }

    });

  }

})();
