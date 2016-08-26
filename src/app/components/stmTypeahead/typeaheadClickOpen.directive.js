'use strict';

(function () {

  angular.module('webPage')
    .directive('typeaheadClickOpen', function () {

      return {

        require: 'ngModel',

        link: function ($scope, elem, attrs, ctrl) {

          //ctrl.$viewChangeListeners.push(function() {
          //  console.log('ctrl.$modelValue', ctrl.$modelValue);
          //  console.log('ctrl.$viewValue', ctrl.$viewValue);
          //});

          var triggerFunc = function () {

            var prev = ctrl.$viewValue;

            ctrl.$setViewValue();
            ctrl.$setViewValue(prev);

          };
          elem.bind('click', triggerFunc);

        }

      };

    });

}());
