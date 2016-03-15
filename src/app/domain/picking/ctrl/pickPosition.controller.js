'use strict';

(function () {

  angular.module('webPage')
    .controller('PickPositionController', function ($scope, $state, models) {

      var vm = this;
      var position = models.PickingOrderPosition.get ($state.params.positionId);

      var states = [
        {
          input: 'volume'
        },{
          input: 'productionInfo'
        }
      ];

      angular.extend(vm, {

        position: position,
        volume: position && position.volume,
        productionInfo: '',

        step: 0,

        done: function () {

          if ( ++ vm.step === states.length ) {
            return vm.save();
          }

        },

        save: function () {
          var POPP = models.PickingOrderPositionPicked;

          POPP.inject({
            pickingOrderPosition: vm.position.id,
            volume: vm.volume,
            productionInfo: vm.productionInfo || null
          });

          $state.go('^');
        }

      });

    });

}());
