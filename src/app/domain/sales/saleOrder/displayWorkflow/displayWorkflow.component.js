(function () {

  angular.module('webPage')
    .component('displayWorkflow', {

      templateUrl: 'app/domain/sales/saleOrder/displayWorkflow/displayWorkflow.html',

      bindings: {
        workflows: '<',
        supplementaryWorkflowData: '<',
        currentWorkflow: '='
      },

      controller: WorkflowController,
      controllerAs: 'vm'

    });

  function WorkflowController(saControllerHelper, $scope) {

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({
      onWorkflowChange
    });

    function onWorkflowChange(workflow) {
      vm.currentWorkflow = _.get(workflow, 'processing');
    }

  }

})();
