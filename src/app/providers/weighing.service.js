(function() {

  angular.module('webPage').service('WeighingService', WeighingService);

  function WeighingService() {

    function weighing() {

      console.info('start weighing');

    }

    return {
      weighing
    }

  }

})();
