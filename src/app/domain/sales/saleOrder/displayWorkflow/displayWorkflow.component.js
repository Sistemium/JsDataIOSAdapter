(function () {

  const LOCALSTORAGE_KEY = 'currentWorkflow';

  angular.module('webPage')
    .component('displayWorkflow', {

      templateUrl: 'app/domain/sales/saleOrder/displayWorkflow/displayWorkflow.html',

      bindings: {
        currentWorkflow: '=',
        workflowsInPromise: '<'
      },

      controller: WorkflowController,
      controllerAs: 'vm'

    });

  function WorkflowController(saControllerHelper, $scope, localStorageService, Schema) {

    const vm = saControllerHelper.setup(this, $scope);
    let {Workflow} = Schema.models();

    vm.use({

      currentWorkflows: {},
      workflowDictionary: {},
      translatedWorkflow: '',
      dropdownClicked: null,

      onWorkflowClick,
      $onInit

    });

    $scope.$watch('vm.workflowsInPromise', () => {
      loadCurrentWorkflows();
    });

    /*
    Functions
     */

    function $onInit() {

      if (!vm.currentWorkflow) {
        vm.currentWorkflow = localStorageService.get(LOCALSTORAGE_KEY) || null;
      }

    }

    function findTranslation(workflow, isInit) {

      let initMsg = 'Выберите статус';

      if (!isInit) {
        if (workflow === vm.currentWorkflow) {
          vm.translatedWorkflow = initMsg;
          return;
        }
      }

      if (workflow === 'bad') {
        vm.translatedWorkflow = 'bad';
        return;
      }

      let translationWorkflow = _.find(vm.workflowDictionary, el => {
        return el.workflowName === workflow;
      });

      vm.translatedWorkflow = _.get(translationWorkflow, 'translation') || initMsg;

    }

    function onWorkflowClick(workflow) {

      findTranslation(workflow);

      if (vm.currentWorkflow === workflow) {
        localStorageService.set(LOCALSTORAGE_KEY, null);
        vm.currentWorkflow = null;
      } else {
        localStorageService.set(LOCALSTORAGE_KEY, workflow);
        vm.currentWorkflow = workflow;
      }

    }

    function loadSupplementaryWorkflowData() {

      Workflow.findAll({code: 'SaleOrder.v2'})
        .then(res => {

          let workflowTranslations = _.get(res[0], 'workflow');

          let mergedWorkflows = _.merge(workflowTranslations, vm.currentWorkflows);

          _.each(mergedWorkflows, (workflow, key) => {

            vm.workflowDictionary.push({
              workflowName: key,
              translation: _.get(workflow, 'label'),
              cls: _.get(workflow, 'cls'),
              cnt: _.get(vm.currentWorkflows[key], 'cnt') || 0
            });

          });

          vm.workflowDictionary = _.orderBy(vm.workflowDictionary, ['cnt'], ['desc']);

          findTranslation(vm.currentWorkflow, true);

        })

    }

    function loadCurrentWorkflows() {

      vm.currentWorkflows = {};
      vm.workflowDictionary = [];

      vm.workflowsInPromise
        .then(res => {

          _.each(res, item => {

            let workflow = _.get(item, 'processing');

            let obj = {
              [workflow]: {
                cnt: _.get(item, 'count()')
              }
            };

            _.assign(vm.currentWorkflows, obj);

          });

          loadSupplementaryWorkflowData();

        })

    }

  }

})();
