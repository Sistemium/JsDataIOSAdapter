(function () {

  angular.module('Warehousing')
    .component('warehouseArticleView', {

      bindings: {
        articleId: '=ngModel',
      },

      templateUrl: 'app/domain/warehousing/articles/view/warehouseArticleView.html',
      controllerAs: 'vm',
      controller: warehouseArticleViewController,

    });

  /** @ngInject */
  function warehouseArticleViewController($scope, Schema, saControllerHelper) {

    const vm = saControllerHelper.setup(this, $scope);
    const { Article, ArticleBarCode } = Schema.models();

    vm.use({
      $onInit() {
        vm.rebindOne(Article, vm.articleId, 'vm.article', onArticle);
      },
    });

    function onArticle() {

      const { id: articleId } = vm.article;

      ArticleBarCode.findAll({ articleId }, { bypassCache: true });
      vm.rebindAll(ArticleBarCode, { articleId }, 'vm.barcodes');

    }

  }

})();
