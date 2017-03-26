(function() {
  'use strict';

  angular
    .module('webPage')
    .directive('volumePad', volumePad);

  var dateRes = [
    /[0123]/,
    /3[01]|[12]\d|[0][1-9]/,
    /\d{2}[01]/,
    /30(0[13456789]|1[012])|31(0[13578]|1[02])|[012]\d(0[1-9]|1[0-2])/,
    ///\d{4}[12]/,
    ///\d{4}(19|20)/,
    /\d{4}[01]/,
    /\d{4}0[89]|\d{4}1[0-7]/
  ];

  var formatters = {

    date: {
      formatSymbols: function (str) {
        var re = /(\d{2})(\d{0,2})(\d{0,4})/;

        return (str || '').replace(re,function (match, dd, mm, yy){
          return dd + (dd ? '/' + mm : '') + (mm.length == 2 ? '/' + yy : '');
        });
      },
      importModel: function  (str) {
        var re = /(\d{2})\/(\d{2})\/(\d{2,4})/;
        str = str || '';

        return re.test(str) ? str.replace(re,function (match, dd, mm, yy){
          return dd + mm + yy;
        }) : '';
      },
      disableButton: function (button, data) {

        if (!button.label) {
          return;
        }

        if (data.length >= 6) {
          return true;
        }

        var re = dateRes [data.length];

        return ! re.test ((data||'') + button.label);

      }
    },

    boxPcs: {
      formatSymbols: function (str) {
        var re = /(\d*)(К|^)(\d*)/;

        return (str || '').replace(re,function (match, box, k, pcs){
          return (box ? box + ' к': '') + (box && pcs && ' ' || '') + (pcs ? pcs + ' б' : '');
        });
      },
      importModel: function (str) {
        var re = /(\d*)( к[ ]{0,1}|^)(\d*)($| б)/;

        return re.test(str) ? str.replace(re,function (match, box, b, pcs){
          return (box ? box+'К' : '') +pcs;
        }) : '';
      },
      exportSymbols: function (str,boxRel) {
        var re = /(\d*)(К|^)(\d*)/;
        var m = (str || '').match(re);
        return parseInt (m[1] || '0') * boxRel + parseInt (m[3] || '0');
      },
      disableButton: function (button, data) {

        if (button.label === 'К') {
          // TODO: maybe need no g
          if (/К/g.test (data)) {
            return true;
          }
        }

      }
    },

    exciseStamp: {
      formatSymbols: function (str) {
        var re = /^(\d{3})(\d{0,9})/;

        return (str || '').replace(re,function (match, prefix, body){
          return prefix + (prefix ? '-' + body : '');
        });
      },
      importModel: function  (str) {
        var re = /^(\d{3})-(\d{8,9})/;

        str = str || '';

        return re.test(str) ? str.replace(re,function (match, prefix, body){
          return prefix + body;
        }) : '';
      },
      disableButton: function (button, data) {

        if (!button.label) {
          return;
        }

        if (data.length >= 12) {
          return true;
        }

        // if (!data.length && button.label !== '2') {
        //   return true;
        // }
        //
        // if (data.length === 1 && button.label.match (/[4-9]/) ) {
        //   return true;
        // }

      }
    }

  };




  /** @ngInject */
  function volumePad () {
    return {

      restrict: 'AC',
      templateUrl: 'app/domain/components/volumePad/volumePad.html',
      scope: {
        model: '=',
        boxRel: '=',
        datatype: '@',
        exportModel: '='
      },

      link: function (scope) {

        var clicked;

        var importFn = scope.datatype && formatters [scope.datatype] .importModel;
        var formatFn = scope.datatype && formatters [scope.datatype] .formatSymbols;
        var disableFn = scope.datatype && formatters [scope.datatype] .disableButton;
        var exportFn = scope.datatype && formatters [scope.datatype] .exportSymbols;

        scope.symbols = angular.isFunction (importFn) ? importFn(scope.model) : scope.model;

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
          ],[
            {
              label: '5'
            },{
              label: '6'
            },{
              label: '7'
            },{
              label: '8'
            }
          ],[
            {
              label: '9'
            },{
              label: '0'
            },{
              label: scope.boxRel ? 'К' : ''
            },{
              i: 'glyphicon glyphicon-remove',
              remove: true
            }
          ]
        ];

        scope.onClick = function (b) {

          if (b.remove) {
            if (scope.symbols) {
              var str = scope.symbols.toString();
              scope.symbols = str.slice (0,str.length - 1);
            }
          } else {
            scope.symbols = (scope.symbols && clicked) ? scope.symbols + b.label : b.label;
          }

          clicked = true;

          scope.model = angular.isFunction (formatFn) ? formatFn (scope.symbols) : scope.symbols;

          if (exportFn) {
            scope.exportModel = exportFn (scope.symbols, scope.boxRel);
          }

        };

        scope.isDisabled = function (b) {
          return angular.isFunction (disableFn) ? disableFn (b,scope.symbols) : false;
        };

      }

    };
  }

})();
