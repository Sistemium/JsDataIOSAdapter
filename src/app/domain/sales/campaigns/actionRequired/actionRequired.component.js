(function () {

  const URL = 'app/domain/sales/campaigns/actionRequired';
  // const { filter } = _;

  angular.module('Sales')
    .component('actionRequired', {

      bindings: {
        required: '<',
      },

      templateUrl: `${URL}/actionRequired.html`,
      controller: actionRequiredController,
      controllerAs: 'vm'

    });

  /** @ngInject */
  function actionRequiredController() {
    _.assign(this, {
      $onInit() {
        console.info(this.required);
      },
    });
  }

})();
