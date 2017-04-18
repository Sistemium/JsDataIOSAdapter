'use strict';

(function (module) {

  module.component('selectUncashingPlace', {

    bindings: {
      selected: '='
    },

    templateUrl: 'app/domain/components/selectUncashingPlace/selectUncashingPlace.html',

    controller: selectUncashingPlaceController,
    controllerAs: 'vm'

  });

  function selectUncashingPlaceController(Schema, $scope) {

    let vm = this;

    _.assign(vm, {

      $onInit,
      optionClick

    });

    const {UncashingPlace} = Schema.models();

    /*
     Functions
     */

    function optionClick(option) {
      vm.selected = option;
    }

    function $onInit() {

      UncashingPlace.bindAll({}, $scope, 'vm.options');
      UncashingPlace.findAll();

    }

  }

})(angular.module('Sales'));
