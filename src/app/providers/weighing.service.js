(function() {

  angular.module('webPage').service('WeighingService', WeighingService);

  function WeighingService($http) {

    function weighing() {

      console.info('start weighing');

      return $http({
        method: 'GET',
        url: 'http://localhost:4000/async'
      })
      //   .then(function successCallback(response) {
      //   // this callback will be called asynchronously
      //   // when the response is available
      //
      //     console.info('successCallback', response);
      //
      // }, function errorCallback(response) {
      //   // called asynchronously if an error occurs
      //   // or server returns response with an error status.
      //
      //     console.info('errorCallback', response);
      //
      //   })
      ;

    }

    function weighingRequired() {
      return true;
    }

    function weighingPossible() {
      return true;
    }

    function shouldWeighing() {
      return weighingPossible() && weighingRequired();
    }

    return {
      weighing,
      weighingRequired,
      weighingPossible,
      shouldWeighing
    }

  }

})();
