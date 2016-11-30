'use strict';

(function () {

  function CatalogueController(Schema, $scope, $state, saControllerHelper, $q) {

    let vm = saControllerHelper.setup(this, $scope);
    let {Article, Stock, ArticleGroup} = Schema.models();
    let currentArticleGroupId = $state.params.articleGroupId || null;

    vm.use({
      currentArticleGroup: null,
      ancestors: [],
      setCurrentArticleGroup
    });

    vm.setBusy(findAll());

    /*
     Listeners
     */

    $scope.$on(
      'rootClick',
      () => $state.go('sales.catalogue')
        .then(() => setCurrentArticleGroup(null))
    );

    /*
     Functions
     */


    function findAll() {
      let options = {headers: {'x-page-size': 3000}};

      return $q.all([
        ArticleGroup.findAll({}, options),
        Stock.findAll({volumeNotZero: true}, options),
        Article.findAll({volumeNotZero: true}, options)
      ])
        .then(() => {
          ArticleGroup.meta.setStock();
          setCurrentArticleGroup(currentArticleGroupId);
        });
    }

    function setCurrentArticleGroup(articleGroupOrId) {

      let articleGroup = articleGroupOrId;

      if (articleGroupOrId && !articleGroupOrId.id) {
        articleGroup = ArticleGroup.get(articleGroupOrId) || null;
      }

      let filter = {
        articleGroupId: _.get(articleGroup, 'id') || null
      };

      vm.currentArticleGroup = articleGroup;

      let children = _.filter(ArticleGroup.filter(filter), hasArticlesOrGroups);
      if (children.length) vm.articleGroups = children;

      if (!vm.articleGroups && articleGroup) {
        vm.articleGroups = _.filter(ArticleGroup.filter({
          articleGroupId: articleGroup.articleGroupId
        }), hasArticlesOrGroups);
      }

      setArticles(articleGroup);
      setAncestors(articleGroup);

      $state.go('.', {articleGroupId: filter.articleGroupId}, {notify: false});

    }

    function hasArticlesOrGroups(articleGroup) {
      return articleGroup.children.length || articleGroup.stockArticles();
    }

    function setAncestors(articleGroup) {
      vm.ancestors = [{name: 'Все товары'}];
      if (articleGroup) {
        Array.prototype.push.apply(vm.ancestors, _.reverse(articleGroup.ancestors()));
        // vm.ancestors.push(articleGroup);
      }

    }

    function setArticles(articleGroup) {

      let filter = {
        // 'stock.volume': {
        //   '>': 0
        // }
      };

      if (articleGroup) {
        filter.articleGroup = {
          'in': _.union([articleGroup.id], _.map(articleGroup.descendants(), 'id'))
        };
      }

      let articles = Article.filter({
        where: filter
      });

      vm.stock = Stock.filter({
        where: {
          articleId: {
            'in': _.map(articles, 'id')
          }
        },
        orderBy: ['article.name']
      })

    }

  }

  angular.module('webPage')
    .controller('CatalogueController', CatalogueController);

}());
