(function() {
  'use strict';

  angular
    .module('webPage')
    .directive('volumePad', volumePad);

  /** @ngInject */
  function volumePad () {
    return {

      restrict: 'AC',
      templateUrl: 'app/domain/volumePad/volumePad.html',
      scope: {
        model: '=',
        boxRel: '='
      },

      link: function (scope) {

        var clicked;

        scope.display = '';

        scope.buttons = [
          [
            {
              label: '1'
            },{
              label: '2'
            },{
              label: '3'
            },{
              label: '4'
            }
          ],[{
              label: '5'
            },{
              label: '6'
            },{
              label: '7'
            },{
              label: '8'
            }
          ],[{
              label: '9'
            },{
              label: '0'
            },{
              label: 'К'
            },{
              i: 'glyphicon glyphicon-remove',
              remove: true
            }
          ]
        ];

        scope.onClick = function (b) {

          if (b.remove) {
            if (scope.model) {
              var str = scope.model.toString();
              scope.model = str.slice (0,str.length - 1);
            }
          } else {
            scope.model = scope.model && clicked ? scope.model + b.label : b.label;
          }

          clicked = true;

        };

      }

    };
  }

})();
