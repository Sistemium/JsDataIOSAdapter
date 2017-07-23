'use strict';

(function () {

  const validLifetime = {

    bindings: {
      dateB: '<',
      dateE: '<'
    },

    template: '<label>Срок:</label> <span> {{vm.formattedDate}} ({{vm.humanizedDuration}}) </span>',

    controller: validLifetimeController,
    controllerAs: 'vm'

  };

  function validLifetimeController() {

    let vm = this;

    _.assign(vm, {
      formattedDate: $onInit()
    });

    function $onInit() {

      let duration = moment(vm.dateE).diff(moment(vm.dateB));

      if (duration === 0) {
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
