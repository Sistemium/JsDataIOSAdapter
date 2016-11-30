'use strict';

(function () {

  function CatalogueController(Schema, $scope, $state, saControllerHelper, $q) {

    let vm = saControllerHelper.setup(this, $scope);

    vm.use({
      currentArticleGroup: null
    });

    let {Article, Stock, ArticleGroup} = Schema.models();
    let options = {headers: {'x-page-size': 3000}};

    let busy = $q.all([
      ArticleGroup.findAll({}, options),
      Stock.findAll({volumeNotZero: true}, options),
      Article.findAll({volumeNotZero: true}, options)
    ]);

    vm.setBusy(busy);

    /*
     Listeners
     */

    $scope.$on('rootClick', () => $state.go('sales.catalogue'));

    vm.rebindAll(Stock, false, 'vm.stock');
    vm.rebindAll(Article, false, 'vm.articles');
    setCurrentArticleGroup(null);

    /*
     Functions
     */


    function setCurrentArticleGroup(articleGroup) {

      let filter = {
        articleGroupId: _.get(articleGroup, 'id') || null
      };

      vm.currentArticleGroup = articleGroup;

      vm.rebindAll(ArticleGroup, filter, 'vm.articleGroups');

    }

  }

  angular.module('webPage')
    .controller('CatalogueController', CatalogueController);

}());
