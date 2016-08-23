'use strict';

(function () {

  function stmTypeaheadDirective($templateRequest, $compile) {

    return {

      restrict: 'EA',
      scope: {
        inputModel: '=',
        placeholder: '@',
        rowsFilters: '@',
        rowsData: '=',
        rowAs: '@',
        inputClass: '@',
        inputId: '@',
        inputEditable: '@',
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

        $templateRequest('app/components/stmTypeahead/stmTypeahead.html')
          .then(function (html) {

            ctrl.rowsFilters = _.replace(ctrl.rowsFilters,`'`,'"');
            var typeAhead = `uib-typeahead='row as row.${ctrl.rowAs} for row in vm.rowsData${ctrl.rowsFilters && "|"+ctrl.rowsFilters}'`;
            html = html.replace('uib-typeahead', typeAhead);

            ctrl.inputEditable = angular.isUndefined(ctrl.inputEditable) ? 'true' : ctrl.inputEditable;
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

  function stmTypeaheadController() {

    var vm = this;

    _.assign(vm, {

      inputFocus: angular.isUndefined(vm.inputFocusFn()) ? angular.noop() : ($event) => vm.inputFocusFn()($event),
      inputBlur: angular.isUndefined(vm.inputFocusFn()) ? angular.noop() : ($event) => vm.inputBlurFn()($event),
      onSelectItem: angular.isUndefined(vm.inputFocusFn()) ? angular.noop() : ($item) => {
        // vm.rootElement.children()[0].blur();
        vm.onSelectItemFn()($item);
      }

    });

  }

})();
