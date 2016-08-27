'use strict';

(function () {

  function stmTypeaheadDirective($templateRequest, $compile) {

    return {

      restrict: 'EA',
      scope: {
        inputModel: '=',
        currentSelected: '=selectedModel',
        addButtonClickFn: '&',
        placeholder: '@',
        rowsFilters: '@',
        rowsData: '=',
        rowAs: '@',
        inputClass: '@',
        inputId: '@',
        inputRequired: '@',
        inputFocusFn: '&',
        inputBlurFn: '&',
        onSelectItemFn: '&'
      },
      controller: stmTypeaheadController,
      controllerAs: 'vm',
      bindToController: true,

      link: function (scope, element, attrs, ctrl) {

        ctrl.rootElement = element;
        ctrl.scope = scope;

        $templateRequest('app/components/stmTypeahead/stmTypeahead.html')
          .then(function (html) {

            ctrl.rowsFilters = _.replace(ctrl.rowsFilters,`'`,'"');
            var typeAhead = `uib-typeahead='row as row.${ctrl.rowAs} for row in vm.rowsData${ctrl.rowsFilters && "|"+ctrl.rowsFilters}'`;
            html = html.replace('uib-typeahead', typeAhead);

            ctrl.inputEditable = angular.isDefined(attrs.inputEditable);
            var inputEditable = `typeahead-editable='${ctrl.inputEditable}'`;
            html = html.replace('typeahead-editable', inputEditable);

            ctrl.inputRequired = angular.isUndefined(ctrl.inputRequired) ? 'false' : ctrl.inputRequired;
            var inputRequired = `ng-required='${ctrl.inputRequired}'`;
            html = html.replace('input-required', inputRequired);

            var template = angular.element(html);
            element.append(template);
            $compile(template)(scope);

          });
      }

    };
  }

  angular.module('webPage')
    .directive('stmTypeahead', stmTypeaheadDirective);

  function stmTypeaheadController($scope) {

    var vm = this;

    _.assign(vm, {

      inputFocus: () => {
        vm.inputModel = vm.lastSearch || '';
        // vm.inputFocusFn() && vm.inputFocusFn()($event);
        // TODO: try scroll on small ios
        // $uiViewScroll(vm.rootElement);
      },
      inputBlur: (event) => {
        if (_.get(event, 'defaultPrevented')) {
          return;
        }
        if (!angular.isObject(vm.inputModel)) {
          vm.lastSearch = vm.inputModel;
          vm.inputModel = vm.currentSelected || vm.inputModel;
        }
        // vm.inputBlurFn() && vm.inputBlurFn()($event);
      },
      onSelectItem: ($item) => {
        // vm.rootElement.children()[0].blur();
        vm.currentSelected = $item;
        vm.onSelectItemFn() && vm.onSelectItemFn()($item);
      },
      addButtonClick: (event) => {
        event.preventDefault();
        vm.addButtonClickFn() && vm.addButtonClickFn()(vm.lastSearch);
      }

    });

    $scope.$watch('vm.inputModel', (newValue)=>{
      if (!angular.isObject(newValue)) {
        vm.lastSearch = vm.inputModel;
      }
    });

  }

})();
