'use strict';

(function () {

  const validLifetime = {

    bindings: {
      dateB: '<',
      dateE: '<'
    },

    template: '<div class="valid-life-time" ng-if="vm.dateB || vm.dateE">' +
      '&nbsp;<label>Актуально:</label>' +
      '&nbsp;<span class="period">{{vm.formattedDate}}</span>' +
      '<span class="humanized" ng-if="vm.humanizedDuration">&nbsp;({{vm.humanizedDuration}})</span>' +
    '</div>',

    controller: validLifetimeController,
    controllerAs: 'vm'

  };

  /** @ngInject */

  function validLifetimeController($scope) {

    let vm = this;

    _.assign(vm, {
      $onInit
    });

    function $onInit() {

      $scope.$watchGroup(['vm.dateB', 'vm.dateE'], formattedDate);
      // formattedDate();

    }

    function formattedDate() {

      if (!vm.dateB && !vm.dateE) {
        vm.formattedDate = null;
        return;
      }

      let duration = moment(vm.dateE).diff(moment());

      if (duration > 0) {
        vm.humanizedDuration = `ещё ${moment.duration(duration).humanize()}`;
      } else if (vm.dateE === moment().format()) {
        vm.humanizedDuration = 'последний день';
      } else {
        vm.humanizedDuration = null;
      }

      if (vm.dateE === vm.dateB) {
        return vm.dateB.slice(5)
      }

      if (vm.dateB.slice(0, 4) === vm.dateE.slice(0, 4)) {
        return vm.dateB.slice(5) + '/' + vm.dateE.slice(5)
      } else {
        return vm.dateB.slice(2) + '/' + vm.dateE.slice(2)
      }

    }

  }

  angular.module('sistemium')
    .component('validLifetime', validLifetime);

})();
