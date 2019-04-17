(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({

          name: 'sales.targets',
          url: '/salesTargets',

          template: '<sales-targets-report></sales-targets-report>',

          data: {
            title: 'Задачи по SKU',
            auth: 'SalesmanAuth',
          },

        });

    });

})();
