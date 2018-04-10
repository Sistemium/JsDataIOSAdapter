(function () {

  angular.module('webPage')
    .filter('ndoc', ndoc);

  function ndoc() {

    return function (input, maxLength = 11) {

      if (!input || input.length <= maxLength) {
        return input;
      }

      let re = new RegExp(`0{${input.length - maxLength}}`);

      return _.replace(input, re, '');

    };

  }

})();
