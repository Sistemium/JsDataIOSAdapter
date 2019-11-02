(function () {

  const outletDetailedView = {
    name: 'outlet',
    url: '/outlet/:outletId',
    template: '<possible-outlet-visit' +
      ' outlet-id="vm.params.outletId"' +
      '></possible-outlet-visit>',
    controller: 'StateController as vm',
    data: {
      rootState: 'sales.outletTasks',
    },
  };

  const outletTasksView = {
    name: 'sales.outletTasks',
    url: '/outletTasks',

    data: {
      title: 'Проверка точек',
      auth: 'SalesmanAuth',
      on: {
        ['possible-outlet-click'](outletId, { $state }) {
          $state.go('sales.outletTasks.outlet', { outletId });
        },
      },
    },

    template: '<possible-outlet-tasks ' +
      // 'article-group-id="vm.params.articleGroupId"' +
      '></possible-outlet-tasks>',
    controller: 'StateController as vm',

    children: [outletDetailedView],

  };

  angular.module('webPage')
    .config(stateHelperProvider => stateHelperProvider.state(outletTasksView));


})();
