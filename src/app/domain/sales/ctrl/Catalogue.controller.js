'use strict';

(function () {

  const SHORT_TIMEOUT = 0;

  function CatalogueController(Schema, $scope, $state, $q, Helpers, SalesmanAuth, $timeout, DEBUG) {

    let {ClickHelper, saEtc, saControllerHelper, saMedia} = Helpers;
    let {Article, Stock, ArticleGroup, PriceType, SaleOrder, SaleOrderPosition, Price} = Schema.models();

    let vm = saControllerHelper.setup(this, $scope)
      .use(ClickHelper);

    let currentArticleGroupId = $state.params.articleGroupId || null;
    let sortedStock;

    vm.use({

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

      onStateChange,

      orderedVolumeFull,
      articleRowHeight,
      articlesScrollerFn

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

    vm.watchScope('vm.saleOrder.id', (newValue, oldValue) => {
      vm.rebindAll(SaleOrderPosition, {saleOrderId: newValue}, 'vm.saleOrderPositions', cacheSaleOrderPositions);
      if (newValue != oldValue && vm.showOnlyOrdered) {
        saleOrderTotalsClick();
      }
    });

    SalesmanAuth.watchCurrent($scope, salesman => {
      let filter = SalesmanAuth.makeFilter({processing: 'draft'});
      vm.currentSalesman = salesman;
      vm.rebindAll(SaleOrder, filter, 'vm.draftSaleOrders');
      SaleOrder.findAllWithRelations(filter)('Outlet');
    });

    vm.watchScope(
      () => saMedia.smWidth || saMedia.xxsWidth,
      (newValue, oldValue) => newValue != oldValue && $scope.$broadcast('vsRepeatTrigger')
    );

    vm.watchScope(
      isWideScreen,
      newValue => vm.isWideScreen = newValue
    );


    /*
     Handlers
     */

    function articlesScrollerFn(resize, element) {
      if ($scope.hasInputInFocus) {
        return;
      }
      element.css({'max-height': (resize.windowHeight - resize.offsetTop - 5)+'px'});
    }

    function clearSearchClick() {
      vm.search = '';
    }

    function saleOrderTotalsClick() {
      vm.showOnlyOrdered = true;
      vm.setBusy($q.all(
        _.map(
          _.filter(vm.saleOrder.positions, pos => !_.get(pos, 'article.stock')),
          pos => Article.loadRelations(pos.articleId, 'Stock')
        )
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

    function cacheSaleOrderPositions() {

      vm.saleOrderPositionByArticle = {};

      let grouped = _.groupBy(vm.saleOrderPositions, 'articleId');

      _.each(grouped, (val, key) => vm.saleOrderPositionByArticle[key] = val[0]);

    }

    function isWideScreen() {
      return !saMedia.xsWidth && !saMedia.xxsWidth;
    }

    function articleRowHeight(stock) {

      let breakPoint = !(saMedia.smWidth || saMedia.xxsWidth);

      let length = _.get(stock, 'article.lastName.length') + _.get(stock, 'article.preName.length');
      let nameLength = _.get(stock, 'article.firstName.length');

      let nameBreak = breakPoint ? 60 : 45;
      let lastBreak = breakPoint ? 90 : 70;

      if (vm.saleOrder) {
        nameBreak -= 7;
        lastBreak -= 10;
      }

      return (length > lastBreak || nameLength > nameBreak) ? 99 : 80;
    }

    function orderedVolumeFull(stock) {
      let position = vm.saleOrderPositionByArticle[stock.articleId];
      if (!position) return;

      return position.article.boxPcs(position.volume).full;
    }

    function findAll() {
      let options = {limit: 6000};
      let volumeNotZero = {
        volume: {
          '>': 0
        }
      };

      return $q.all([
        ArticleGroup.findAll({}, options),
        Stock.findAll({
          volumeNotZero: true,
          where: volumeNotZero
        }, options),
        Article.findAll({
          volumeNotZero: true,
          where: {
            'ANY stocks': volumeNotZero
          }
        }, options),
        PriceType.findAll(),
        Price.meta.cachedFindAll()
      ])
        .then(() => {

          DEBUG('findAll');
          ArticleGroup.meta.setupCaches();
          DEBUG('findAll', 'setupCaches');
          vm.currentPriceType = PriceType.meta.getDefault();
          DEBUG('findAll', 'currentPriceType');
          filterStock();
          setCurrentArticleGroup(currentArticleGroupId);
          DEBUG('findAll', 'setCurrentArticleGroup');

        });
    }

    function filterStock() {

      DEBUG('filterStock', 'start');

      let stockCache = _.map(
        _.orderBy(Stock.getAll(), 'article.name'),
        stock => _.pick(stock, ['id', 'volume', 'displayVolume', 'article', 'articleId'])
      );

      DEBUG('filterStock', 'orderBy');

      let prices;
      let useCustomPrice = !!vm.currentPriceType.parent;
      let discount = 1;
      let priceType = vm.currentPriceType;

      if (useCustomPrice) {
        priceType = vm.currentPriceType.parent;
        discount += vm.currentPriceType.discountPercent / 100;
      }

      prices = _.groupBy(priceType.prices(), 'articleId');

      DEBUG('filterStock', 'prices');

      vm.prices = {};
      _.each(prices, (val, key) => {
        vm.prices[key] = val[0].price * discount
      });

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

      // let children = _.filter(childGroups, group);

      DEBUG('setCurrentArticleGroup', 'hasArticlesOrGroupsInStock');

      // TODO show only saleOrder positions and sort by deviceCts if user clicks 'show saleOrder'
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

      $state.go('.', {articleGroupId: filter.articleGroupId, q: vm.search}, {notify: false});

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
        articles = _.filter(articles, article => ids.indexOf(article.articleGroupId) > -1);
      }

      if (articleGroup) {
        let ids = _.union([articleGroup.id], _.map(articleGroup.descendants(), 'id'));
        articles = _.filter(articles, article => ids.indexOf(article.articleGroupId) > -1);
      }

      if (vm.search) {
        let reg = new RegExp(_.escapeRegExp(vm.search), 'ig');
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

  angular.module('webPage')
    .controller('CatalogueController', CatalogueController);

}());
