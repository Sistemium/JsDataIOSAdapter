'use strict';

(function () {
  angular.module('core.services')
    .directive('innInput', innInput);

  function innInput() {
    return {
      restrict: 'AC',
      require: 'ngModel',

      link: function(scope, elm, attrs, ctrl) {

        ctrl.$validators.innInput = function(modelValue, viewValue) {

          if (angular.isString(viewValue)) {

            if(viewValue.match(/^([0-9]{10}|[0-9]{12})$/im)){

              if (viewValue.length == 10) return checkTenDigitsINN(viewValue);
              if (viewValue.length == 12) return checkTwelveDigitsINN(viewValue);

            }

          }

          return false;

        };

        function checkTenDigitsINN(inn) {

          var dgts = inn.split('');
          var checkSum = ((2*dgts[0] + 4*dgts[1] + 10*dgts[2] + 3*dgts[3] + 5*dgts[4] + 9*dgts[5] + 4*dgts[6] + 6*dgts[7] + 8*dgts[8]) % 11) % 10;
          return (dgts[9] == checkSum);

        }

        function checkTwelveDigitsINN(inn) {

          var dgts = inn.split('');
          var checkSum1 = ((7*dgts[0] + 2*dgts[1] + 4*dgts[2] + 10*dgts[3] + 3*dgts[4] + 5*dgts[5] + 9*dgts[6] + 4*dgts[7] + 6*dgts[8] + 8*dgts[9]) % 11) % 10;

          if (dgts[10] == checkSum1) {

            var checkSum2 = ((3*dgts[0] + 7*dgts[1] + 2*dgts[2] + 4*dgts[3] + 10*dgts[4] + 3*dgts[5] + 5*dgts[6] + 9*dgts[7] + 4*dgts[8] + 6*dgts[9] + 8*dgts[10]) % 11) % 10;
            return (dgts[11] == checkSum2);

          }
          return false;

        }

      }

    };
  }

})();
