(function () {

  angular.module('Warehousing')
    .component('warehouseArticleList', {

      bindings: {
        articles: '<',
        onClick: '&',
      },

      controllerAs: 'vm',
      templateUrl: 'app/domain/warehousing/articles/list/warehouseArticleList.html',

      /** @ngInject */
      controller($scope) {

        const vm = _.assign(this, {

          $onInit() {
            onSearch();
          },

          articleClick($item) {
            vm.onClick({ $item });
          },

        });

        $scope.$watch('vm.search', onSearch);
        $scope.$watch('vm.articles', onSearch);

        function onSearch() {

          const { articles, search } = vm;

          if (!search) {
            vm.articlesFiltered = articles;
            return;
          }

          const re = new RegExp(`${_.escapeRegExp(search)}`, 'i');

          vm.articlesFiltered = _.filter(articles, ({ name }) => re.test(name));

        }

      },

    });

})();
