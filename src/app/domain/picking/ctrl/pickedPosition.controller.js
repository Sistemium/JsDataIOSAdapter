'use strict';

(function () {

  angular.module('webPage')
    .controller('PickedPositionController', function ($scope, $state, models) {

      var vm = this;
      var POPP = models.PickingOrderPositionPicked;
      var POP = models.PickingOrderPosition;

      var mode = $state.params.positionId ? 'pick' : 'picked';

      var pickedPosition = mode === 'picked' && POPP.get ($state.params.pickedPositionId);

      var position = pickedPosition && pickedPosition.parent || POP.get ($state.params.positionId);

      var initVolume, initExport;

      if (pickedPosition) {
        initVolume = pickedPosition.boxPcs().full;
        initExport = pickedPosition.volume;
      } else if (position) {
        initVolume = position.unPickedBoxPcs().full;
        initExport = position.unPickedVolume();
      }

      var states = [
        {
          input: 'volume',
          label: 'Собрано',
          validate: function (val) {
            return !! val;
          },
          value: initVolume,
          exportValue: initExport
        }
      ];

      var barCode = pickedPosition && pickedPosition.code;

      if (barCode) {

        vm.barCode = barCode;

      } else if (position && position.Article.productionInfoType) {
        states.push ({
          input: 'productionInfo',
          label: 'Дата розлива',
          validate: function (val) {
            return !! /\d{2}\/\d{2}\/\d{2,4}/.test (val);
          },
          value: pickedPosition && pickedPosition.productionInfo || ''
        });
      }

      angular.extend(vm, {

        position: position,
        pickedPosition: pickedPosition,
        states: states,
        step: pickedPosition ? undefined : 0,

        notDone: function () {

          if (vm.step>=0) {
            return ! states [vm.step].validate(states [vm.step].value);
          }

        },

        done: function () {

          if (angular.isUndefined (vm.step)) {
            return vm.save();
          }

          if (!pickedPosition){
            if (vm.step + 1 === states.length ) {
              return vm.save();
            } else {
              vm.step ++;
            }
          } else {
            vm.step = undefined;
          }

        },

        edit: function (step) {

          vm.step = step;

        },

        save: function () {

          if (!pickedPosition) {
            POPP.create ({
              pickingOrderPosition: position.id,
              volume: states[0].exportValue,
              productionInfo: states.length > 1 ? states[1].value : null
            }).then (function (){
              $state.go('^');
            });
          } else {
            pickedPosition.volume = states[0].exportValue;
            pickedPosition.productionInfo = states.length > 1 ? states[1].value : null;
            POPP.save(pickedPosition.id).then (function (){
              $state.go('^');
            });
          }

        },

        remove: function () {
          POPP.destroy (pickedPosition).then(function() {
            $state.go('^');
          });
        }

      });

    });

}());
