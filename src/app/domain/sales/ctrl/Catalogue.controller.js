'use strict';

(function () {

  function CatalogueController(Schema, $scope, $state, $q, Helpers) {

    let {ClickHelper, saEtc, saControllerHelper} = Helpers;
    let {Article, Stock, ArticleGroup, PriceType, SaleOrder} = Schema.models();

    let vm = saControllerHelper.setup(this, $scope)
      .use(ClickHelper);

    let currentArticleGroupId = $state.params.articleGroupId || null;
    let sortedStock = [];

    vm.use({

      currentArticleGroup: null,
      ancestors: [],
      articleGroupIds: {},
      search: $state.params.q || '',
      saleOrderId: $state.params.saleOrderId,

      articleGroupClick: setCurrentArticleGroup,
      priceTypeClick,
      setSaleOrderClick,
      saleOrderTotalsClick,
      clearSearchClick,

      onStateChange,

      orderedVolumeFull

    });

    vm.setBusy(findAll());

    /*
     Listeners
     */

    vm.rebindAll(PriceType, null, 'vm.priceTypes');
    vm.rebindAll(SaleOrder, {processing: 'draft'}, 'vm.draftSaleOrders');

    $scope.$on(
      'rootClick',
      () => $state.go('sales.catalogue')
        .then(() => setCurrentArticleGroup(null))
    );

    $scope.$watch('vm.search', (newValue, oldValue) => {
      if (newValue != oldValue) setCurrentArticleGroup(vm.currentArticleGroup)
    });

    $scope.$watch('vm.saleOrder.id', (newValue, oldValue) => {
      if (newValue != oldValue && vm.showOnlyOrdered) {
        saleOrderTotalsClick();
      }
    });

    onStateChange($state.name, $state.params);

    /*
     Handlers
     */

    function clearSearchClick() {
      vm.search = '';
      saEtc.focusElementById('search-input');
    }

    function saleOrderTotalsClick() {
      vm.showOnlyOrdered = true;
      vm.setBusy($q.all(
        _.map(vm.saleOrder.positions, pos => Article.loadRelations(pos.articleId, 'Stock'))
      ))
        .then(() => {
          filterStock();
          return setCurrentArticleGroup(vm.currentArticleGroup);
        })
        .catch(error => console.error(error));
    }

    function setSaleOrderClick(saleOrder) {
      $state.go('sales.catalogue.saleOrder', {saleOrderId: _.get(saleOrder, 'id')});
    }

    function priceTypeClick(priceType) {
      vm.currentPriceType = priceType;
      PriceType.meta.setDefault(priceType);
      filterStock();
      setCurrentArticleGroup(vm.currentArticleGroup);
    }

    function onStateChange(to, params) {

      vm.saleOrderId = params.saleOrderId;
      vm.rebindOne(SaleOrder, vm.saleOrderId, 'vm.saleOrder');

      currentArticleGroupId = params.articleGroupId;

      if (!vm.saleOrderId) {
        vm.showOnlyOrdered = false;
      }

    }

    /*
     Functions
     */

    function orderedVolumeFull(stock) {
      let positions = _.get(vm.saleOrder, 'positions');
      if (!positions) return;
      let position = _.find(positions, {articleId: stock.articleId});
      if (!position) return;
      return position.article.boxPcs(position.volume).full;
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
          vm.currentPriceType = PriceType.meta.getDefault();
          filterStock();
          setCurrentArticleGroup(currentArticleGroupId);

          SaleOrder.findAllWithRelations({processing: 'draft'})('Outlet');

        });
    }

    function filterStock() {

      sortedStock = Stock.filter({
        orderBy: ['article.name']
      });

      let prices;
      let useCustomPrice = !!vm.currentPriceType.parent;
      let discount = 1;

      if (useCustomPrice) {
        prices = _.groupBy(vm.currentPriceType.parent.prices, 'articleId');
        discount += vm.currentPriceType.discountPercent / 100;
      } else {
        prices = _.groupBy(vm.currentPriceType.prices, 'articleId');
      }

      vm.prices = {};
      _.each(prices, (val, key) => {
        vm.prices[key] = val[0].price * discount
      });

      _.each(_.get(vm, 'saleOrder.positions'), pos => vm.prices[pos.articleId] = pos.price);

      sortedStock = _.filter(sortedStock, stock => {
        return vm.prices[stock.articleId]
      });

    }

    function setCurrentArticleGroup(articleGroupOrId) {

      let articleGroup = articleGroupOrId;

      if (_.get(articleGroupOrId, 'showAll')) {
        vm.showOnlyOrdered = false;
      }

      if (articleGroupOrId && !articleGroupOrId.id) {
        articleGroup = _.isObject(articleGroupOrId) ? null : ArticleGroup.get(articleGroupOrId);
      }

      let ownStock = getStockByArticlesOfGroup(articleGroup);

      let filter = {
        articleGroupId: _.get(articleGroup, 'id') || null
      };

      vm.currentArticleGroup = articleGroup;

      let groupIds = articleGroupIds(ownStock);
      let children = _.filter(ArticleGroup.filter(filter), hasArticlesOrGroupsInStock(groupIds));

      // TODO show only saleOrder positions and sort by deviceCts if user clicks 'show saleOrder'
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

      vm.noMoreChildren = !children.length;

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

      vm.ancestors = [{name: 'Все товары', showAll: true}];

      if (vm.showOnlyOrdered) {
        vm.ancestors.push({name: 'Товары заказа', id: false});
      }

      if (articleGroup) {
        Array.prototype.push.apply(vm.ancestors, _.reverse(articleGroup.ancestors()));
      }

    }

    function scrollArticlesTop() {
      let scrollParent = saEtc.getElementById('scroll-articles');
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

      if (vm.showOnlyOrdered) {
        filter.id = {
          'in': _.map(vm.saleOrder.positions, 'articleId')
        }
      }

      let articles = Article.filter({
        where: filter
      });

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
