'use strict';

(function () {

  function CatalogueController(Schema, $scope, $state, saControllerHelper, $q, $window) {

    let vm = saControllerHelper.setup(this, $scope);
    let {Article, Stock, ArticleGroup, Price, PriceType} = Schema.models();
    let currentArticleGroupId = $state.params.articleGroupId || null;
    let sortedStock = [];

    vm.use({
      currentArticleGroup: null,
      ancestors: [],
      setCurrentArticleGroup,
      priceTypeClick,
      articleGroupIds: {},
      search: $state.params.q || ''
    });

    vm.setBusy(findAll());

    /*
     Listeners
     */


    vm.rebindAll(PriceType, null, 'vm.priceTypes');

    $scope.$on(
      'rootClick',
      () => $state.go('sales.catalogue')
        .then(() => setCurrentArticleGroup(null))
    );

    $scope.$watch('vm.search', (newValue, oldValue) => {
      if (newValue != oldValue) setCurrentArticleGroup(vm.currentArticleGroup)
    });

    /*
     Functions
     */

    function priceTypeClick(priceType) {
      //TODO write PriceType to localStorage
      vm.currentPriceType = priceType;
      filterStock();
      setCurrentArticleGroup(vm.currentArticleGroup);
    }

    function findAll() {
      let options = {headers: {'x-page-size': 3000}};

      return $q.all([
        ArticleGroup.findAll({}, options),
        Stock.findAll({volumeNotZero: true}, options),
        Article.findAll({volumeNotZero: true}, options),
        PriceType.findAllWithRelations()('Price', null, null, options)
      ])
        .then(() => {
          vm.currentPriceType = _.first(PriceType.filter({limit: 1}));
          filterStock();
          setCurrentArticleGroup(currentArticleGroupId);
        });
    }


    function filterStock() {

      sortedStock = Stock.filter({
        orderBy: ['article.name']
      });

      let prices = _.groupBy(vm.currentPriceType.prices, 'articleId');

      console.log(prices);

      vm.prices = {};
      _.each(prices, (val, key) => vm.prices[key] = val[0].price);

      sortedStock = _.filter(sortedStock, stock => vm.prices[stock.articleId]);

    }


    function setCurrentArticleGroup(articleGroupOrId) {

      let articleGroup = articleGroupOrId;

      if (articleGroupOrId && !articleGroupOrId.id) {
        articleGroup = ArticleGroup.get(articleGroupOrId) || null;
      }

      let ownStock = getStockByArticlesOfGroup(articleGroup);

      let filter = {
        articleGroupId: _.get(articleGroup, 'id') || null
      };

      vm.currentArticleGroup = articleGroup;

      let groupIds = articleGroupIds(ownStock);
      let children = _.filter(ArticleGroup.filter(filter), hasArticlesOrGroupsInStock(groupIds));

      vm.stock = ownStock;

      if (children.length) {
        vm.currentArticleGroupParent = articleGroup;
        vm.articleGroups = children;
      } else if (articleGroup && articleGroup.articleGroup) {
        ownStock = getStockByArticlesOfGroup(articleGroup.articleGroup);
        groupIds = articleGroupIds(ownStock);
        vm.articleGroups = _.filter(ArticleGroup.filter({
          articleGroupId: articleGroup.articleGroupId
        }), hasArticlesOrGroupsInStock(groupIds));
      } else {
        vm.articleGroups = null;
      }

      vm.articleGroupIds = groupIds;
      vm.articleGroupIdsLength = Object.keys(vm.articleGroupIds).length;

      setAncestors(articleGroup);
      scrollArticlesTop();

      $state.go('.', {articleGroupId: filter.articleGroupId, q: vm.search}, {notify: false});

    }


    function hasArticlesOrGroupsInStock(groupIds) {
      return (articleGroup) => {
        return groupIds[articleGroup.id]
          || _.find(articleGroup.descendants(), item => groupIds[item.id])
      }
    }

    function setAncestors(articleGroup) {
      vm.ancestors = [{name: 'Все товары'}];
      if (articleGroup) {
        Array.prototype.push.apply(vm.ancestors, _.reverse(articleGroup.ancestors()));
      }
    }

    function scrollArticlesTop() {
      let scrollParent = $window.document.getElementById('scroll-articles');
      if (!scrollParent) return;
      scrollParent.scrollTop = 0;
    }

    function getStockByArticlesOfGroup(articleGroup) {

      let filter = {};

      if (vm.search) {
        filter.name = {
          'likei': '%' + vm.search + '%'
        }
      }

      if (articleGroup) {
        filter.articleGroup = {
          'in': _.union([articleGroup.id], _.map(articleGroup.descendants(), 'id'))
        };
      }

      let articles = Article.filter({
        where: filter
      });

      filter = {};

      if (articleGroup || vm.search) {
        filter.articleId = {
          'in': _.map(articles, 'id')
        };
      }

      let articleIds = _.groupBy(articles, 'id');
      return _.filter(sortedStock, stock => articleIds[stock.articleId]);

    }

    function articleGroupIds(stock) {
      return _.groupBy(stock, 'article.articleGroup');
    }

  }

  angular.module('webPage')
    .controller('CatalogueController', CatalogueController);

}());
