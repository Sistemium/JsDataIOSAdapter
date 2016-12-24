'use strict';

(function () {

  const SHORT_TIMEOUT = 0;

  function CatalogueController(Schema, $scope, $state, $q, Helpers, SalesmanAuth, $timeout, DEBUG, IOS, Sockets) {

    const {ClickHelper, saEtc, saControllerHelper, saMedia} = Helpers;
    const {Article, Stock, ArticleGroup, PriceType, SaleOrder, SaleOrderPosition, Price} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope)
      .use(ClickHelper);

    let currentArticleGroupId = $state.params.articleGroupId || null;
    let sortedStock;

    vm.use({

      debounce: IOS.isIos() ? 600 : 200,
      showOnlyOrdered: $state.params.ordered === 'true',

      currentArticleGroup: null,
      ancestors: [],
      articleGroupIds: {},
      search: $state.params.q || '',
      saleOrderId: $state.params.saleOrderId,
      saleOrderPositions: false,
      isOpenOutletPopover: false,
      isWideScreen: isWideScreen(),
      saleOrderPositionByArticle: {},

      articleGroupClick: setCurrentArticleGroup,
      priceTypeClick,
      setSaleOrderClick,
      saleOrderTotalsClick,
      clearSearchClick,
      articleGroupAndCollapseClick,

      onStateChange,
      articleRowHeight

    });

    vm.setBusy($timeout(SHORT_TIMEOUT).then(findAll));

    onStateChange($state.name, $state.params);

    /*
     Listeners
     */

    vm.rebindAll(PriceType, null, 'vm.priceTypes');

    vm.onScope(
      'rootClick',
      () => $state.go('sales.catalogue')
        .then(() => setCurrentArticleGroup(null))
    );

    vm.watchScope('vm.search', (newValue, oldValue) => {
      if (newValue != oldValue) setCurrentArticleGroup(vm.currentArticleGroup)
    });

    vm.watchScope('vm.saleOrder.id', newValue => {
      vm.rebindAll(SaleOrderPosition, {saleOrderId: newValue}, 'vm.saleOrderPositions', cacheSaleOrderPositions);
    });

    SalesmanAuth.watchCurrent($scope, salesman => {
      let filter = SalesmanAuth.makeFilter({processing: 'draft'});
      vm.currentSalesman = salesman;
      vm.rebindAll(SaleOrder, filter, 'draftSaleOrders');
      SaleOrder.findAllWithRelations(filter)('Outlet');
    });

    vm.watchScope(
      isWideScreen,
      (newValue, oldValue) => newValue != oldValue && $scope.$broadcast('vsRepeatTrigger')
    );

    vm.watchScope(
      isWideScreen,
      newValue => vm.isWideScreen = newValue
    );

    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));
    $scope.$on('$destroy', Sockets.onJsData('jsData:update:finished', onJSDataFinished));

    /*
     Handlers
     */


    function articleGroupAndCollapseClick(item) {
      vm.isArticleGroupsExpanded = false;
      setCurrentArticleGroup(item);
    }

    function onJSData(event) {
      if (event.resource === 'Stock') {
        if (_.get(event, 'data.articleId')) {
          Stock.inject(event.data);
        }
      }
    }

    function onJSDataFinished(event) {

      if (_.get(event, 'model.name') === 'Stock') {

        DEBUG('onJSDataFinished:reloadStock');

        _.each(vm.stock, stock => {
          let updated = event.index[stock.id];
          if (!updated) return;
          stock.volume = updated.volume;
          stock.displayVolume = updated.displayVolume;
        });

      }
    }

    function clearSearchClick() {
      vm.search = '';
    }

    function reloadVisible() {
      filterStock();
      return setCurrentArticleGroup(vm.currentArticleGroup);
    }

    function saleOrderTotalsClick(showOnlyOrdered) {

      vm.showOnlyOrdered = showOnlyOrdered || !vm.showOnlyOrdered;

      vm.setBusy($q.all(
        _.map(
          _.filter(vm.saleOrder.positions, pos => pos.articleId && !Stock.filter({articleId: pos.articleId}).length),
          pos => Article.find(pos.articleId)
            .then(article => Article.loadRelations(article, 'Stock'))
        )
      ))
        .then(reloadVisible)
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

      if (vm.currentState === 'catalogue') $scope.saleOrderExpanded = false;

    }

    /*
     Functions
     */

    function cacheSaleOrderPositions(ev, newPositions) {

      vm.saleOrderPositionByArticle = {};

      let grouped = _.groupBy(vm.saleOrderPositions, 'articleId');

      _.each(grouped, (val, key) => vm.saleOrderPositionByArticle[key] = val[0]);

      if (vm.showOnlyOrdered && newPositions && newPositions.length) {
        saleOrderTotalsClick(true);
      }

    }

    function isWideScreen() {
      return !saMedia.xsWidth && !saMedia.xxsWidth;
    }

    function articleRowHeight() {
      return isWideScreen() ? 80 : 74;
    }

    function findAll() {
      let options = {limit: 10000};
      let volumeNotZero = {
        volume: {
          '>': 0
        }
      };

      return PriceType.findAll()
        .then(() => ArticleGroup.cachedFindAll({}, options))
        .then(() => Article.cachedFindAll({
          volumeNotZero: true,
          where: {
            'ANY stocks': volumeNotZero
          }
        }, options))
        .then(() => Stock.cachedFindAll({
          volumeNotZero: true,
          where: volumeNotZero
        }, options))
        .then(() => Price.cachedFindAll(options))
        .then(() => {

          DEBUG('findAll', 'finish');
          vm.currentPriceType = PriceType.meta.getDefault();
          filterStock();
          setCurrentArticleGroup(currentArticleGroupId);
          DEBUG('findAll', 'setCurrentArticleGroup');

        });
    }

    function filterStock() {

      DEBUG('filterStock', 'start');

      let discount = 1;
      let priceType = vm.currentPriceType;

      if (!vm.currentPriceType) return;

      let stockCache = _.orderBy(_.map(
        Stock.getAll(),
        stock => _.pick(stock, ['id', 'volume', 'displayVolume', 'article', 'articleId'])
      ), item => item.article && item.article.name);

      DEBUG('filterStock', 'orderBy');


      if (vm.currentPriceType.parent) {
        priceType = vm.currentPriceType.parent;
        discount += vm.currentPriceType.discountPercent / 100;
      }

      DEBUG('filterStock', 'prices');

      vm.prices = {};

      _.each(priceType.prices(), price => vm.prices[price.articleId] = price.price * discount);

      _.each(_.get(vm, 'saleOrder.positions'), pos => vm.prices[pos.articleId] = pos.price);

      DEBUG('filterStock', 'vm.prices');

      sortedStock = _.filter(stockCache, stock => vm.prices[stock.articleId]);

      DEBUG('filterStock', 'end');

    }

    function setCurrentArticleGroup(articleGroupOrId) {

      let articleGroup = articleGroupOrId;

      if (_.get(articleGroupOrId, 'showAll')) {
        vm.showOnlyOrdered = false;
      }

      if (articleGroupOrId && !articleGroupOrId.id) {
        articleGroup = _.isObject(articleGroupOrId) ? null : ArticleGroup.get(articleGroupOrId);
      }

      DEBUG('setCurrentArticleGroup');

      let ownStock = getStockByArticlesOfGroup(articleGroup);

      DEBUG('setCurrentArticleGroup', 'getStockByArticlesOfGroup');

      let filter = {
        articleGroupId: _.get(articleGroup, 'id') || null
      };

      vm.currentArticleGroup = articleGroup;

      let groupIds = articleGroupIds(ownStock);
      DEBUG('setCurrentArticleGroup', 'articleGroupIds');

      let childGroups = _.filter(ArticleGroup.getAll(), filter);
      DEBUG('setCurrentArticleGroup', 'hasArticlesOrGroupsInStock0');

      let children = _.filter(childGroups, hasArticlesOrGroupsInStock(groupIds));
      DEBUG('setCurrentArticleGroup', 'hasArticlesOrGroupsInStock');

      vm.stock = ownStock;

      if (children.length) {

        vm.currentArticleGroupParent = articleGroup;
        vm.articleGroups = children;

      } else if (articleGroup && articleGroup.articleGroup) {

        ownStock = getStockByArticlesOfGroup(articleGroup.articleGroup);
        groupIds = articleGroupIds(ownStock);

        vm.articleGroups = _.filter(
          articleGroup.articleGroup.children,
          hasArticlesOrGroupsInStock(groupIds)
        );

        DEBUG('setCurrentArticleGroup', '!children.length');

      } else {
        vm.articleGroups = null;
      }

      vm.articleGroupIds = groupIds;
      vm.articleGroupIdsLength = Object.keys(vm.articleGroupIds).length;

      setAncestors(articleGroup);

      vm.noMoreChildren = !children.length;

      scrollArticlesTop();

      $state.go('.', {
        articleGroupId: filter.articleGroupId,
        q: vm.search,
        ordered: vm.showOnlyOrdered || null
      }, {notify: false});

    }


    function hasArticlesOrGroupsInStock(groupIds) {
      return (articleGroup) => {
        return groupIds[articleGroup.id]
          || articleGroup.hasDescendants(groupIds);
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

      let articles = Article.getAll();

      if (vm.showOnlyOrdered) {
        let ids = _.map(vm.saleOrder.positions, 'articleId');
        articles = _.filter(articles, article => ids.indexOf(article.id) > -1);
      }

      if (articleGroup) {
        let ids = _.union([articleGroup.id], _.map(articleGroup.descendants(), 'id'));
        articles = _.filter(articles, article => ids.indexOf(article.articleGroupId) > -1);
      }

      if (vm.search) {
        let reg = new RegExp(_.replace(_.escapeRegExp(vm.search), ' ', '.+'), 'i');
        articles = _.filter(articles, article => reg.test(article.name));
      }

      let articleIds = _.groupBy(articles, 'id');

      return _.filter(sortedStock, stock => articleIds[stock.articleId]);

    }

    function articleGroupIds(stock) {
      return _.groupBy(stock, item => {
        return _.get(item, 'article.articleGroupId');
      });
    }

  }

  angular.module('Sales')
    .controller('CatalogueController', CatalogueController);

}());
