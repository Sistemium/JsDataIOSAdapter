(function () {

  const LOCALSTORAGE_KEY = 'currentWorkflow';

  angular.module('webPage')
    .component('filterWorkflow', {

      templateUrl: 'app/domain/sales/filterWorkflow/filterWorkflow.html',

      bindings: {
        currentWorkflow: '=',
        workflowsInPromise: '<',
        workflow: '=?'
      },

      controller: filterWorkflowController,
      controllerAs: 'vm'

    });

  function filterWorkflowController(saControllerHelper, $scope, localStorageService, Schema) {

    const vm = saControllerHelper.setup(this, $scope);
    let {Workflow} = Schema.models();

    vm.use({

      stats: {},
      workflowStats: [],

      onWorkflowClick,
      $onInit

    });

    $scope.$watch('vm.workflowsInPromise', refresh);
    $scope.$watch('vm.currentWorkflow', onWorkflowChange);


    /*
    Functions
     */

    function onWorkflowChange(currentWorkflow) {
      vm.workflow = currentWorkflow && vm.workflowDictionary ? vm.workflowDictionary[currentWorkflow] : null;
    }

    function $onInit() {

      if (!vm.currentWorkflow) {
        vm.currentWorkflow = localStorageService.get(LOCALSTORAGE_KEY) || null;
      }

    }

    function onWorkflowClick(workflow = null) {

      localStorageService.set(LOCALSTORAGE_KEY, workflow);
      vm.currentWorkflow = workflow;

      vm.popoverIsOpen = false;

    }

    function loadSupplementaryWorkflowData() {

      Workflow.findAll({code: 'SaleOrder.v2'})
        .then(res => {

          let workflow = vm.workflowDictionary = _.get(res[0], 'workflow');

          let items = _.map(workflow, (workflow, processing) => {

            let item = _.pick(workflow, ['label', 'cls']);

            return _.assign(item, {
              processing,
              cnt: _.get(vm.stats[processing], 'count()') || 0
            });

          });

          vm.workflowStats = _.orderBy(items, ['cnt', 'cls'], ['desc', 'asc']);
          onWorkflowChange(vm.currentWorkflow);

        })

    }

    function refresh() {

      vm.stats = {};
      vm.workflowStats = [];

      vm.workflowsInPromise
        .then(res => {

          _.each(res, item => {

            vm.stats[item.processing] = item;

          });

          loadSupplementaryWorkflowData();

        })

    }

  }

})();
