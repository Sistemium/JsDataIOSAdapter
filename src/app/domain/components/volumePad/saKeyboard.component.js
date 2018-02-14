(function () {

  const saKeyboard = {
    bindings: {
      model: '=',
      boxRel: '=',
      datatype: '@',
      exportModel: '=?',
      modelMax: '=',
      touched: '='
    },

    templateUrl: 'app/domain/components/volumePad/saKeyboard.html',
    controllerAs: 'vm',
    controller: saKeyboardController

  };
  /** @ngInject */
  function saKeyboardController($scope, $injector) {

    const vm = _.assign(this, {

      isDisabled,
      onClick,
      $onInit

    });

    const formatterName = `saKeyboard${_.upperFirst(vm.datatype)}`;

    const formatter = new $injector.get(formatterName)();

    const importFn = vm.datatype && formatter.importModel || _.identity;
    const formatFn = vm.datatype && formatter.formatSymbols || _.identity;
    const exportFn = vm.datatype && formatter.exportSymbols || _.identity;

    const disableFn = vm.datatype && formatter.disableButton;

    function $onInit() {

      vm.buttons = [
        [{label: '1'}, {label: '2'}, {label: '3'}, {label: '4'}],
        [{label: '5'}, {label: '6'}, {label: '7'}, {label: '8'}],
        [{label: '9'}, {label: '0'}, {
          label: _.isNumber(vm.boxRel) ? 'К' : (vm.boxRel || '')
        }, {
          i: 'glyphicon glyphicon-remove',
          remove: true
        }]
      ];

      onModelChange(vm.exportModel);
      $scope.$watch('vm.exportModel', onModelChange);

    }

    /*
    Functions
     */

    function onClick(b) {

      if (b.remove) {
        if (vm.symbols) {
          let str = vm.symbols.toString();
          vm.symbols = str.slice(0, str.length - 1);
        }
      } else {
        vm.symbols = (vm.symbols && vm.touched) ? vm.symbols + b.label : b.label;
      }

      vm.touched = true;

      vm.model = formatFn(vm.symbols);

      vm.exportModel = exportFn(vm.symbols, vm.boxRel);

      if (vm.modelMax && vm.exportModel > vm.modelMax) {
        vm.exportModel = vm.modelMax;
        vm.model = vm.symbols = importFn(vm.exportModel, vm.boxRel);
      }

    }

    function isDisabled(b) {
      return angular.isFunction(disableFn) ? disableFn(b, vm.symbols, vm.modelMax, vm.touched) : false;
    }

    function onModelChange(newValue, oldValue) {

      if (newValue === oldValue) {
        return;
      }

      if (exportFn(vm.symbols, vm.boxRel) === vm.exportModel) {
        return;
      }

      vm.symbols = importFn(vm.exportModel, vm.boxRel);
      vm.model = formatFn(vm.symbols);

    }

  }


  angular.module('webPage')
    .component('saKeyboard', saKeyboard);


})();
