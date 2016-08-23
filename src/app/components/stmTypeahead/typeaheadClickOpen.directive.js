'use strict';

(function () {

  angular.module('webPage')
    .directive('typeaheadClickOpen', function ($timeout) {

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
            $timeout(function () {
              ctrl.$setViewValue(prev);
            });

            //var prev = ctrl.$modelValue || '';
            //
            //if (prev) {
            //
            //  ctrl.$setViewValue('');
            //  $timeout(function () {
            //    ctrl.$setViewValue(prev);
            //  });
            //
            //} else {
            //  ctrl.$setViewValue(' ');
            //  $timeout(function () {
            //    ctrl.$setViewValue('');
            //  });
            //}

          };
          elem.bind('click', triggerFunc);

        }

      };

    });

}());
