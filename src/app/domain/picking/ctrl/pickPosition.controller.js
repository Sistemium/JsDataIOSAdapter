'use strict';

(function () {

  angular.module('webPage')
    .controller('PickPositionController', function ($scope, $state, models) {

      var vm = this;
      var position = models.PickingOrderPosition.get ($state.params.positionId);

      angular.extend(vm, {

        position: position,
        volume: position && position.volume,

        save: function () {
          var POPP = models.PickingOrderPositionPicked;

          var popp = POPP.inject({
            pickingOrderPosition: vm.position.id,
            volume: vm.volume
          });

          console.log (popp);

          $state.go('^');
        }

      });

    });

}());
