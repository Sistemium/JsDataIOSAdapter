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
          input: 'volume'
        },{
          input: 'productionInfo'
        }
      ];

      angular.extend(vm, {

        position: position,
        pickedPosition: pickedPosition,

        volume: pickedPosition.volume,
        productionInfo: pickedPosition.productionInfo,

        done: function () {

          if (angular.isUndefined (vm.step)) {
            return vm.save();
          }

          if ( ++ vm.step === states.length ) {
            vm.step = undefined;
          }

        },

        edit: function (step) {

          vm.step = step;

        },

        save: function () {

          pickedPosition.volume = vm.volume;
          pickedPosition.productionInfo = vm.productionInfo;

          $state.go('^');

        },

        remove: function () {
          POPP.eject (pickedPosition);
          $state.go('^');
        }

      });

    });

}());
