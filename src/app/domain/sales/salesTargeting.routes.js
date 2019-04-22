(function () {

  const targetsReportDetailedView = {
    name: 'detailed',
    url: '/:articleGroupId',

    data: {
      //
    },

    template: '<sales-targets-by-article-group-report ' +
      'report-data="vm.outletsData[vm.articleGroupId]" ' +
      'target-groups="vm.targetGroups"' +
      '></sales-targets-by-article-group-report>',

  };

  const targetsReportView = {
    name: 'sales.targets',
    url: '/salesTargets',

    data: {
      title: 'Задачи по SKU',
      auth: 'SalesmanAuth',
      watch: {
        ['vm.params.articleGroupId'](articleGroupId, { $state }) {
          if (articleGroupId) {
            $state.go('sales.targets.detailed', { articleGroupId });
          } else {
            $state.go('sales.targets');
          }
        },
      },
    },

    template: '<sales-targets-report ' +
      'article-group-id="vm.params.articleGroupId"' +
      '></sales-targets-report>',
    controller: 'StateController as vm',

    children: [targetsReportDetailedView],

  };

  angular.module('webPage')
    .config(stateHelperProvider => stateHelperProvider.state(targetsReportView));

})();
