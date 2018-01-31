'use strict';

(function (module) {

  module.component('contractView', {

    bindings: {
      contracts: '<'
    },

    transclude: true,

    templateUrl: 'app/domain/components/contractView/contractView.html',

    controller: contractViewController,
    controllerAs: 'vm'

  });

  function contractViewController() {
  }

})(angular.module('Sales'));
