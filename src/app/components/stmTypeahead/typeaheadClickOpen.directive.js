'use strict';

(function () {

  angular.module('webPage')
    .directive('typeaheadClickOpen', function ($timeout) {

      return {

        require: 'ngModel',

        link: function($scope, elem, attrs, ctrl) {

          var triggerFunc = function() {

            var prev = ctrl.$modelValue || '';

            if (prev) {

              ctrl.$setViewValue('');
              $timeout(function() {
                ctrl.$setViewValue(prev);
              });

            } else {
              ctrl.$setViewValue(' ');
            }

          };
          elem.bind('click', triggerFunc);

        }

      };

    });

}());
