'use strict';

(function () {

  angular.module('webPage')
    .controller('PickedPositionController', function ($scope, $state, models) {

      var vm = this;
      var POPP = models.PickingOrderPositionPicked;
      var pickedPosition = POPP.get ($state.params.positionId);
      var position = pickedPosition.parent;

      var states = [
        {
          input: 'volume',
          label: 'Собрано',
          validate: function (val) {
            return !! val;
          },
          value: pickedPosition && angular.copy (pickedPosition.boxPcs().full),
          exportValue: pickedPosition && angular.copy (pickedPosition.volume)
        }
      ];

      if (position.Article.productionInfoType) {
        states.push ({
          input: 'productionInfo',
          label: 'Дата розлива',
          validate: function (val) {
            return !! /\d{2}\/\d{2}\/\d{4}/.test (val);
          },
          value: pickedPosition.productionInfo
        });
      }

      angular.extend(vm, {

        position: position,
        pickedPosition: pickedPosition,
        states: states,

        notDone: function () {

          if (vm.step>=0) {
            return ! states [vm.step].validate(states [vm.step].value);
          }

        },

        done: function () {

          if (angular.isUndefined (vm.step)) {
            return vm.save();
          }

          vm.step = undefined;

        },

        edit: function (step) {

          vm.step = step;

        },

        save: function () {

          pickedPosition.volume = states[0].exportValue;
          pickedPosition.productionInfo = states.length > 1 ? states[1].value : null;

          $state.go('^');

        },

        remove: function () {
          POPP.eject (pickedPosition);
          $state.go('^');
        }

      });

    });

}());
