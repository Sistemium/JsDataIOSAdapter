'use strict';

(function (module) {

  module.component('selectUncashingPlace', {

    bindings: {
      selected: '=',
      initId: '<'
    },

    templateUrl: 'app/domain/components/selectUncashingPlace/selectUncashingPlace.html',

    controller: selectUncashingPlaceController,
    controllerAs: 'vm'

  });

  function selectUncashingPlaceController(Schema, $scope) {

    let vm = this;

    _.assign(vm, {

      $onInit,
      optionClick: setSelected

    });

    const {UncashingPlace} = Schema.models();

    /*
     Functions
     */

    function setSelected(item) {
      vm.selected = item;
    }

    function $onInit() {

      UncashingPlace.bindAll({}, $scope, 'vm.options');
      UncashingPlace.findAll()
        .then(data => setSelected(_.find(data, {id: vm.initId})));

    }

  }

})(angular.module('Sales'));
