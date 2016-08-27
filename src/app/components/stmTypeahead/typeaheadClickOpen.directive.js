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

          elem.bind('focus', () => $scope.vm.startHack = true);

          elem.bind('click', () => {

            var prev = ctrl.$viewValue;

            ctrl.$setViewValue();

            $timeout(10)
              .then(()=>{
                ctrl.$setViewValue(prev);
                $scope.vm.startHack = false;
              });

          });

        }

      };

    });

}());
