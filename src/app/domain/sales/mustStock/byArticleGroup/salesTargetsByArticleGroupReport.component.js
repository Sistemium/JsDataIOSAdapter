(function () {

  angular.module('Sales')
    .component('salesTargetsByArticleGroupReport', {

      bindings: {
        reportData: '<',
        targetGroups: '<',
      },

      templateUrl: 'app/domain/sales/mustStock/' +
        'byArticleGroup/salesTargetsByArticleGroupReport.html',

      controller: salesTargetsByArticleGroupReportController,
      controllerAs: 'vm'

    });


  function salesTargetsByArticleGroupReportController() {
  }

})();
