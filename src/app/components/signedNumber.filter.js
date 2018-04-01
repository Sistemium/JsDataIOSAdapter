(function () {

  angular.module('core.services')
    .filter('signedNumber', signedNumberFilter);

  function signedNumberFilter($filter) {

    const numberFilter = $filter('number');

    return function stnumberFilter(input, decimals) {

      let out = numberFilter(input, decimals);

      return input > 0 ? `+${out}` : out;

    };
  }

})();
