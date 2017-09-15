'use strict';

(function () {

  const validLifetime = {

    bindings: {
      dateB: '<',
      dateE: '<'
    },

    template: '<div class="valid-life-time" ng-if="vm.dateB || vm.dateE">' +
    '<label>Актуально:</label> <span>{{vm.formattedDate}}</span> <span>(еще {{vm.humanizedDuration}})</span>' +
    '</div>',

    controller: validLifetimeController,
    controllerAs: 'vm'

  };

  function validLifetimeController() {

    let vm = this;

    _.assign(vm, {
      $onInit
    });

    function $onInit() {
      if (vm.dateB || vm.dateE) {
        vm.formattedDate = formattedDate();
      }
    }

    function formattedDate() {

      let duration = moment(vm.dateE).diff(moment(vm.dateB));

      if (!duration) {
        duration = 86400000;
      }

      vm.humanizedDuration = moment.duration(duration).humanize();

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
