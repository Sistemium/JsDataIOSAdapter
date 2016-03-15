'use strict';

(function () {

  angular.module('webPage')
    .controller('PickPositionController', function ($scope, $state, models) {

      var vm = this;
      var position = models.PickingOrderPosition.get ($state.params.positionId);

      var states = [
        {
          input: 'volume',
          label: 'Собрано',
          validate: function (val) {
            return !! val;
          },
          value: position && angular.copy (position.boxPcs().full),
          exportValue: position && angular.copy (position.volume)
        }
      ];

      if (position.Article.productionInfoType) {
        states.push ({
          input: 'productionInfo',
          label: 'Дата розлива',
          validate: function (val) {
            return !! /\d{2}\/\d{2}\/\d{4}/.test (val);
          },
          value: ''
        });
      }

      angular.extend(vm, {

        position: position,
        states: states,

        step: 0,

        notDone: function () {

          if (vm.step>=0) {
            return ! states [vm.step].validate(states [vm.step].value);
          }

        },

        done: function () {

          if ( vm.step + 1 === states.length ) {
            return vm.save();
          } else {
            vm.step ++;
          }

        },

        save: function () {
          var POPP = models.PickingOrderPositionPicked;

          POPP.inject({
            pickingOrderPosition: vm.position.id,
            volume: states[0].exportValue,
            productionInfo: states.length > 1 ? states[1].value : null
          });

          $state.go('^');
        }

      });

    });

}());
