'use strict';

(function () {

  const SHORT_TIMEOUT = 0;
  const LOW_STOCK_THRESHOLD = 24;
  const FONT_SIZE_KEY = 'catalogue.fontSize';

  function CatalogueController(Schema, $scope, $state, $q, Helpers, SalesmanAuth, $timeout,
                               DEBUG, IOS, Sockets, localStorageService, OutletArticles, GalleryHelper) {

    const {ClickHelper, saEtc, saControllerHelper, saMedia, toastr, DomainOption} = Helpers;
    const {
      Article, Stock, ArticleGroup, PriceType, SaleOrder,
      SaleOrderPosition,
      SaleOrderDiscount,
      Price,
      CatalogueAlert,
      ArticlePicture,
      ContractPriceGroup,
      ContractArticle,
      PartnerPriceGroup,
      PartnerArticle,
      SalesmanOutletRestriction,
      OutletRestriction,
      Restriction,
      RestrictionArticle,
      OutletSalesmanContract
    } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope)
      .use(ClickHelper);

    let currentArticleGroupId = $state.params.articleGroupId || null;
    let sortedStock;

    GalleryHelper.setupController(vm, $scope);

    vm.use({

      debounce: IOS.isIos() ? 600 : 200,
      showOnlyOrdered: $state.params.ordered === 'true',
      lowStockThreshold: LOW_STOCK_THRESHOLD,

      hasKS: DomainOption.hasSaleOrderKS(),
      currentArticleGroup: null,
      ancestors: [],
      articleGroupIds: {},
      search: $state.params.q || '',
      saleOrderId: $state.params.saleOrderId,
      saleOrderPositions: false,
      isOutletPopoverOpen: false,
      isWideScreen: isWideScreen(),
      saleOrderPositionByArticle: {},
      hideBoxes: localStorageService.get('hideBoxes') || false,
      showImages: localStorageService.get('showImages') || false,
      showFirstLevel: localStorageService.get('showFirstLevel') || false,
      stockWithPicIndex: [],
      discountsBy: {},
      discounts: {article: {}, priceGroup: {}, saleOrder: {}},
      restrictionsBy: {},
      fontSize: parseInt(localStorageService.get(FONT_SIZE_KEY)) || 14,
      filters: [],
      articleTooltipTpl: 'app/domain/sales/views/article.tooltip.html',

      saleOrdersDisabled: DomainOption.saleOrdersDisabled(),
      noFactor: !DomainOption.hasArticleFactors(),

      articleGroupClick: setCurrentArticleGroup,
      priceTypeClick,
      setSaleOrderClick,
      saleOrderTotalsClick,
      clearSearchClick,
      articleGroupAndCollapseClick,
      toggleShowImagesClick,
      toggleShowFirstLevelClick,
      toggleHideBoxesClick,
      onSaleOrderClick,

      compDiscountClick,
      bPlusButtonClick,
      kPlusButtonClick,

      pieceVolumeClick,
      articleTagClick,
      removeFilterClick,
      thumbClick,
      onScrolledToBeginning,

      onSearchEnter,
      onStateChange,
      // articleRowHeight,
      alertCheck,
      alertTriggers: _.groupBy(CatalogueAlert.getAll(), 'articleGroupId')

    });

    const maxPositions = DomainOption.saleOrderMaxPositions();

    let busy = $timeout(SHORT_TIMEOUT)
      .then(findAll)
      .then(() => {

        vm.watchScope('vm.saleOrder.outlet.partner.allowAnyVolume', () => {
          vm.noFactor = _.get(vm.saleOrder, 'outlet.partner.allowAnyVolume') || !DomainOption.hasArticleFactors();
        });

        vm.watchScope('vm.saleOrder.id', newValue => {

          let afterChangeOrder = true;

          DEBUG('on vm.saleOrder.id', _.get(vm.saleOrder, 'priceTypeId'), _.get(vm.saleOrder, 'priceType'));

          if (vm.saleOrder && vm.saleOrder.priceTypeId !== _.get(vm, 'currentPriceType.id')) {
            setPriceType(vm.saleOrder.priceType);
          }

          vm.rebindAll(SaleOrderPosition, {saleOrderId: newValue}, 'vm.saleOrderPositions', (e, newPositions) => {

            cacheSaleOrderPositions();

            if (afterChangeOrder && newPositions && newPositions.length && vm.showOnlyOrdered) {
              saleOrderTotalsClick(true);
              afterChangeOrder = false;
            }

          });

        });

        $scope.$watchGroup(['vm.saleOrder.contractId', 'vm.saleOrderId'], () => $timeout(10).then(onContractChange));

        SalesmanAuth.watchCurrent($scope, salesman => {

          let filter = SalesmanAuth.makeFilter({processing: 'draft'});

          vm.currentSalesman = salesman;
          vm.rebindAll(SaleOrder, filter, 'draftSaleOrders');

        });

        vm.watchScope('vm.saleOrder.outlet.id', (outletId) => {

          if (!outletId) return vm.articleStats = {};

          OutletArticles.groupByArticleId(outletId)
            .then(data => {
              vm.articleStats = {};
              _.each(data, item => vm.articleStats[item.articleId] = item);

              if (vm.showOnlyShipped) setCurrentArticleGroup(vm.currentArticleGroup);

            })
            .then(() => {
              return vm.saleOrder.outlet.DSLoadRelations('Partner', {bypassCache: true});
            });

        });

        $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));
        $scope.$on('$destroy', Sockets.onJsData('jsData:update:finished', onJSDataFinished));
        $scope.$on('$destroy', Sockets.onJsData('jsData:updateCollection', onJSDataCollection));

      });

    vm.setBusy(busy);

    // onStateChange($state.name, $state.params);

    /*
     Listeners
     */

    $scope.$on('setSaleOrderId', setSaleOrderId);

    vm.watchScope('vm.fontSize', fontSize => {
      if (fontSize) {
        localStorageService.set(FONT_SIZE_KEY, fontSize);
      }
    });

    vm.onScope(
      'rootClick',
      () => $state.go('sales.catalogue')
        .then(() => setCurrentArticleGroup(null))
    );

    vm.watchScope('vm.search', (newValue, oldValue) => {
      if (newValue != oldValue) {
        vm.firstLevelGroups = null;
        setCurrentArticleGroup(vm.currentArticleGroup);
      }
    });

    $scope.$watchCollection('vm.filters', (o, n) => {
      if (o && n && (o.length || n.length)) {
        vm.firstLevelGroups = null;
        setCurrentArticleGroup(vm.currentArticleGroup);
      }
    });

    vm.watchScope(
      isWideScreen,
      (newValue, oldValue) => {
        if (newValue !== oldValue) {
          $scope.$broadcast('vsRepeatTrigger');
        }
        vm.isWideScreen = newValue;
        vm.articleRowHeight = articleRowHeight();
      }
    );

    /*
     Handlers
     */

    function onContractChange() {
      setDiscounts(_.get(vm.saleOrder, 'contractId'), _.get(vm.saleOrder, 'outlet.partnerId'), vm.saleOrderId);
      setRestrictions(_.get(vm.saleOrder, 'salesmanId'), _.get(vm.saleOrder, 'outletId'));
    }

    function onJSDataCollection(e) {

      if (e.resource !== 'Stock') return;

      DEBUG('jsData:updateCollection', e);
      //
      // let options = {
      //   limit: 10000,
      //   bypassCache: true,
      //   offset: `1-${moment(e.data.ts).format('YYYYMMDDHHmm')}00000-0`
      // };

      Stock.meta.findAllUpdates()
        .then(res => {

          let index = {};

          _.each(res, item => index[item.id] = item);

          onJSDataFinished({
            model: Stock,
            index: index,
            data: res
          });

        });

    }

    function setSaleOrderId(event, saleOrderId) {

      // console.warn('setSaleOrderId', saleOrderId);

      vm.saleOrderId = saleOrderId;

      vm.rebindOne(SaleOrder, saleOrderId, 'vm.saleOrder');

    }

    function onScrolledToBeginning() {

      $timeout(100)
        .then(() => {

          let parent = saEtc.getElementById('scroll-articles-parent');

          let {children} = parent.children[0];

          _.each(children, node => {
            node.style.left = '0';
          });

        });

    }

    function onSaleOrderClick() {

      if (vm.isSaleOrderPopoverOpen) {
        return;
      }

      let filter = SalesmanAuth.makeFilter({processing: 'draft'});

      vm.saleOrderBusy = SaleOrder.findAllWithRelations(filter)('Outlet');

    }

    function onSearchEnter() {
      setCurrentArticleGroup();
    }

    function thumbClick(stock) {

      $scope.imagesAll = $scope.imagesAll || _.uniq(_.filter(_.map(vm.stock, 'article.avatar'), 'srcThumbnail'));

      vm.thumbnailClick(_.get(stock, 'article.avatar'));

    }

    function compDiscountClick(stock) {

      let position = vm.saleOrderPositionByArticle[stock.articleId];

      if (!position) return;

      position.isCompDiscount = !position.isCompDiscount;
      position.updateTs();
      position.safeSave();

    }

    function kPlusButtonClick(stock) {
      $scope.$broadcast('kPlusButtonClick', stock.article, stock);
    }

    function bPlusButtonClick(stock) {
      $scope.$broadcast('bPlusButtonClick', stock.article, stock);
    }

    function toggleShowFirstLevelClick() {
      vm.showFirstLevel = !vm.showFirstLevel;
      setCurrentArticleGroup(vm.currentArticleGroup);
    }

    function toggleShowImagesClick() {

      vm.showImages = !vm.showImages;

      if (!vm.showImages) return;

      ArticlePicture.findAll({}, {limit: 10000});

    }

    function toggleHideBoxesClick() {

      vm.hideBoxes = !vm.hideBoxes;

    }

    function articleGroupAndCollapseClick(item) {
      vm.isArticleGroupsExpanded = false;
      setCurrentArticleGroup(item);
    }

    function onJSData(event) {
      if (event.resource === 'Stock') {
        if (_.get(event, 'data.articleId')) {
          Stock.meta.inject(event.data);
        }
      }
    }

    function onJSDataFinished(event) {

      if (_.get(event, 'model.name') === 'Stock') {

        DEBUG('onJSDataFinished:reloadStock');

        let count = event.data.length;

        // FIXME: article won't appear if wasn't in stock

        _.each(vm.stock, stock => {
          let updated = event.index[stock.id];
          if (!updated) return;
          stock.volume = updated.volume;
          stock.displayVolume = updated.displayVolume;
        });

        if (count) {
          toastr.info(
            `Изменились остатки: ${count} ${SaleOrder.meta.positionsCountRu(count)}`,
            'Обновление данных',
            {timeOut: 5000}
          );
        }

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
      vm.firstLevelGroups = null;

      if (vm.showOnlyOrdered) {
        vm.currentArticleGroup = null;
        vm.search = '';
        vm.filters = [];
      }

      vm.setBusy(_.map(
        _.filter(vm.saleOrder.positions, pos => pos.articleId && !Stock.meta.getByArticleId(pos.articleId)),
        pos => Article.find(pos.articleId)
          .then(Stock.meta.loadArticle)
      ))
        .then(reloadVisible)
        .catch(error => console.error(error));
    }

    function setSaleOrderClick(saleOrder) {
      $state.go('sales.catalogue.saleOrder', {saleOrderId: _.get(saleOrder, 'id')});
    }

    function priceTypeClick(priceType) {
      PriceType.meta.setDefault(priceType);
      setPriceType(priceType);
    }

    function setPriceType(priceType) {

      DEBUG('setPriceType', priceType);

      vm.currentPriceType = priceType;
      $q.when(filterStock())
        .then(() => {
          setCurrentArticleGroup(vm.currentArticleGroup);
        });
    }

    function onStateChange(to, params) {

      // console.warn('onStateChange', params);

      setSaleOrderId({}, params.saleOrderId);

      currentArticleGroupId = params.articleGroupId;

      if (!vm.saleOrderId) {
        vm.showOnlyOrdered = false;
      }

      if (vm.currentState === 'catalogue') $scope.saleOrderExpanded = false;

    }

    function removeFilterClick(filter) {
      addFilter(filter);
    }

    function articleTagClick(tag) {
      addFilter({tag: tag.code, label: tag.label});
    }

    function pieceVolumeClick(pieceVolume) {

      let existing = _.find(vm.filters, 'pieceVolume');

      if (existing) _.remove(vm.filters, existing);

      if (_.get(existing, 'pieceVolume') !== pieceVolume) {
        addFilter({pieceVolume, label: pieceVolume + 'л'});
      }

    }

    /*
     Functions
     */

    function addFilter(filter) {

      if (_.find(vm.filters, filter)) {
        _.remove(vm.filters, filter);
      } else {
        vm.filters.push(filter);
      }

    }

    // TODO: move to a separate helper

    function setDiscounts(contractId, partnerId, saleOrderId) {

      if (!contractId || !partnerId || !vm.prices) {
        vm.discountsBy = {};
        // console.warn('setDiscounts exit 1');
        setDiscountsWithModelData();
        return $q.resolve();
      }

      let priceTypeId = vm.currentPriceType.id;

      if (_.isEqual(vm.discountsBy, {partnerId, contractId, priceTypeId, saleOrderId})) {
        // console.warn('setDiscounts exit 2');
        return $q.resolve();
      }

      vm.discountsBy = {contractId, partnerId, priceTypeId, saleOrderId};

      const contractFilter = {
        contractId: {'==': contractId},
        discount: {'!=': 0}
      };

      const partnerFilter = {
        partnerId: {'==': partnerId},
        discount: {'!=': 0}
      };

      $q.all([
        ContractArticle.uncachedFindAll({where: contractFilter}, {limit: 10000}),
        ContractPriceGroup.uncachedFindAll({where: contractFilter}, {limit: 10000}),
        PartnerArticle.uncachedFindAll({where: partnerFilter}, {limit: 10000}),
        PartnerPriceGroup.uncachedFindAll({where: partnerFilter}, {limit: 10000}),
        vm.saleOrder.DSLoadRelations('SaleOrderDiscount')
          .catch(() => {
            vm.saleOrderDiscountsDisabled = true;
          })
      ])
        .then(allData => {

          let {discounts} = vm.saleOrder;
          let saleOrderScopeDiscount = _.find(discounts, {discountScope: 'saleOrder'});

          let discountModel = {
            article: _.keyBy([
              ..._.filter(discounts, 'articleId'),
              ..._.filter(allData[0], 'discount'),
              ..._.filter(allData[2], 'discount')
            ], 'articleId'),
            priceGroup: _.keyBy([
              ..._.filter(discounts, 'priceGroupId'),
              ..._.filter(allData[1], 'discount'),
              ..._.filter(allData[3], 'discount')
            ], 'priceGroupId'),
            saleOrder: saleOrderScopeDiscount || {}
          };

          // console.warn(`discountModel ${contractId} ${partnerId}`, discountModel);

          setDiscountsWithModelData(discountModel.article, discountModel.priceGroup, discountModel.saleOrder);

          _.each(_.get(vm, 'saleOrder.positions'), pos => {

            let {articleId} = pos;
            let price = vm.prices[articleId];

            let posDiscount = pos.priceOrigin ? _.round((pos.priceOrigin - pos.price) / pos.priceOrigin * 100.0, 2) : 0;

            if (!price) {
              price = vm.prices[articleId] = {price: pos.priceOrigin};
              // console.warn(`setting prices from position ${pos.id}`);
            }

            if (!pos.priceOrigin || pos.priceOrigin !== price.price) {
              pos.priceOrigin = price.price;
              pos.price = price.price * (1.0 - posDiscount / 100.0);
              pos.updateCost();
            }

            let articleDiscount = vm.discounts.article[articleId];

            let discount = articleDiscount ||
              vm.discounts.priceGroup[pos.article.priceGroupId] ||
              saleOrderScopeDiscount;

            if (!discount && posDiscount || discount && Math.abs(pos.priceOrigin * (1.0 - discount.discount / 100.0) - pos.price) > 0.01) {
              let customDiscount = _.assign(
                articleDiscount || SaleOrderDiscount.createInstance({discountScope: 'article'}), {
                  discount: posDiscount,
                  articleId
                });
              vm.discounts.article[articleId] = customDiscount;
            }

          });

          DEBUG('setDiscounts end', vm.discounts);

          if (_.get(vm.saleOrder, 'positions.length')) {
            vm.saleOrder.updateTotalCost();
          }

          return vm.discounts;

        })
        .catch(e => console.error(e));

    }

    function setDiscountsWithModelData(article = {}, priceGroup = {}, saleOrder = {}) {

      vm.discounts = {priceGroup, saleOrder, article};

    }

    let maxPositionsAlertShown = false;

    function cacheSaleOrderPositions() {

      vm.saleOrderPositionByArticle = _.keyBy(vm.saleOrderPositions, 'articleId');

      if (maxPositions && vm.saleOrderPositions.length > maxPositions && !maxPositionsAlertShown) {

        maxPositionsAlertShown = true;

        toastr.error('В заказе больше чем 50 позиций', 'Внимание!', {onHidden});

      }

      function onHidden() {
        maxPositionsAlertShown = false
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

      return PriceType.findAllWithRelations()(['PriceType'])
        .then(() => {

          // TODO: move to model
          return OutletSalesmanContract.groupBy({}, ['priceTypeId'])
            .then(auths => {

              _.each(auths, auth => {
                let priceTypeId = auth.priceTypeId;
                if (!priceTypeId) return;
                _.set(PriceType.get(priceTypeId), 'isVisible', true);
              });

              vm.priceTypes = PriceType.filter({isVisible: true});

              if (!vm.currentPriceType) {
                vm.currentPriceType = _.get(vm.saleOrder, 'priceType') || PriceType.meta.getDefault();
              }

              // console.warn('currentPriceType:', _.get(vm.currentPriceType, 'name'));

            });

        })
        .then(() => ArticleGroup.cachedFindAll({}, options))
        .then(() => Article.cachedFindAll({
          volumeNotZero: true,
          where: {
            'ANY stocks': volumeNotZero
          }
        }, options))
        .then(() => {
          if (vm.showImages) {
            ArticlePicture.findAll({}, options);
          }
        })
        .then(() => Stock.meta.cachedFindAll({
          where: volumeNotZero
        }, options))
        .then(() => Price.cachedFindAll(_.assign({priceTypeId: vm.currentPriceType.id}, options)))
        .then(() => {
          if (vm.currentPriceType.parentId) {
            return Price.cachedFindAll(_.assign({priceTypeId: vm.currentPriceType.parentId}, options));
          }
        })
        .then(() => {

          DEBUG('findAll', 'finish');

          filterStock();
          setCurrentArticleGroup(currentArticleGroupId);

          DEBUG('findAll', 'setCurrentArticleGroup');

        });
    }

    function filterStock() {

      DEBUG('filterStock', 'start');

      if (vm.busyFilteringStock) {
        DEBUG('filterStock', 'busy');
        return vm.busyFilteringStock;
      }

      vm.busyFilteringStock = true;

      let parentMultiplier = 1;
      let priceType = vm.currentPriceType;

      if (!vm.currentPriceType) return;

      let stockCache = _.orderBy(
        _.map(
          Stock.meta.getAll(),
          stock => {
            return {
              id: stock.id,
              volume: stock.volume,
              displayVolume: stock.displayVolume,
              article: stock.article,
              articleId: stock.articleId,
              priceAgent: stock.priceAgent,
              discountPercent,
              discountPrice,
              priceOrigin,
              discountScope,
              setDiscountScope
            };
          }
        ),
        item => item.article && item.article.name
      );

      DEBUG('filterStock', 'orderBy');

      if (vm.currentPriceType.parent) {
        priceType = vm.currentPriceType.parent;
        parentMultiplier += vm.currentPriceType.discountPercent / 100;
      }

      if (!priceType.prices()) {
        DEBUG('filterStock', 'cachedFindAll Price', priceType.id);
        return Price.cachedFindAll({priceTypeId: priceType.id, limit: 10000})
          .then(prices => {
            vm.busyFilteringStock = false;
            return _.isEmpty(prices) ? prices : filterStock();
          });
      }

      DEBUG('filterStock', 'prices');

      vm.prices = {};

      _.each(priceType.prices(), price => {

        let priceOrigin = _.round(price.price * parentMultiplier, 2);

        vm.prices[price.articleId] = {
          price: priceOrigin
        };

      });

      DEBUG('filterStock', 'vm.prices');

      sortedStock = _.filter(stockCache, stock => vm.prices[stock.articleId]);

      DEBUG('filterStock', 'end');

      setDiscounts(_.get(vm.saleOrder, 'contractId'), _.get(vm.saleOrder, 'outlet.partnerId'), vm.saleOrderId);

      vm.busyFilteringStock = false;

      /*
      Stock functions
       */

      function discountPercent(discountScope) {

        let {discounts} = vm;

        switch (discountScope) {
          case 'article':
            return _.get(discounts.article[this.articleId], 'discount');
          case 'priceGroup':
            return _.get(discounts.priceGroup[this.article.priceGroupId], 'discount');
          case 'saleOrder':
            return discounts.saleOrder.discount;
          default:
            return _.get(discounts.article[this.articleId] ||
              discounts.priceGroup[this.article.priceGroupId] ||
              discounts.saleOrder, 'discount');
        }

      }

      function discountPrice() {
        return _.round(vm.prices[this.articleId].price * (1.0 - (this.discountPercent() || 0) / 100.0), 2);
      }

      function priceOrigin() {
        return vm.prices[this.articleId].price;
      }

      function discountScope() {
        return vm.discounts.article[this.articleId] && 'article' ||
          vm.discounts.priceGroup[this.article.priceGroupId] && 'priceGroup' ||
          'saleOrder';
      }

      function setDiscountScope(discountScope, discountPercent = this.discountPercent(discountScope)) {

        let path = 'saleOrder';
        let filter = {};
        let {articleId} = this;

        if (discountScope === 'article') {

          path = `article.${articleId}`;

          filter.articleId = articleId;
          filter.stock = this;

        } else {

          let saleOrderDiscount = vm.discounts.article[articleId];

          if (saleOrderDiscount) {
            delete vm.discounts.article[articleId];
            if (saleOrderDiscount.constructor.name === 'SaleOrderDiscount') {
              saleOrderDiscount.id && saleOrderDiscount.DSDestroy();
            }
          }

          if (discountScope === 'priceGroup') {
            path = `priceGroup.${this.article.priceGroupId}`;
            filter.priceGroupId = this.article.priceGroupId;
          } else if (discountScope === 'saleOrder') {

            let saleOrderDiscount = vm.discounts.priceGroup[this.article.priceGroupId];

            if (saleOrderDiscount) {
              delete vm.discounts.priceGroup[this.article.priceGroupId];
              if (saleOrderDiscount.constructor.name === 'SaleOrderDiscount') {
                saleOrderDiscount.DSDestroy();
              }
            }

            path = 'saleOrder';

          }

        }

        _.set(vm.discounts, `${path}.discount`, discountPercent);

        filter.path = path;

        updatePrices(discountScope, filter);

        if (!vm.saleOrderDiscountsDisabled) {
          SaleOrderDiscount.meta.updateSaleOrder(vm.saleOrder, path, discountPercent)
            .then(res => _.set(vm.discounts, path, res))
            .catch(_.identity);
        }

      }

      function updatePrices(discountScope, filter) {

        let stockByPosition = false;

        switch (discountScope) {
          case 'article': {
            stockByPosition = position => {
              return position.articleId === filter.articleId && filter.stock;
            };
            break;
          }
          case 'saleOrder': {
            stockByPosition = position => _.find(sortedStock, stock => {
              return stock.articleId === position.articleId && stock.discountScope() === 'saleOrder';
            });
            break;
          }
          case 'priceGroup': {
            stockByPosition = position => _.find(sortedStock, stock => {
              return stock.articleId === position.articleId &&
                stock.discountScope() === 'priceGroup' &&
                stock.article.priceGroupId === filter.priceGroupId;
            });
            break;
          }
          default: {
            console.error('unknown discountScope', discountScope, filter);
            return;
          }
        }

        let saleOrder = false;

        _.each(vm.saleOrderPositionByArticle, position => {

          let stock = stockByPosition(position);

          if (!stock) {
            return;
          }

          let newPrice = stock.discountPrice();

          if (_.round(Math.abs(newPrice - position.price), 2) < 0.01) {
            return;
          }

          position.price = newPrice;
          position.updateCost();
          saleOrder = position.saleOrder;

          if (!vm.saleOrderDiscountsDisabled) {
            SaleOrderDiscount.meta.updateSaleOrder(vm.saleOrder, filter.path, stock.discountPercent())
              .catch(_.identity);
          }

        });

        if (saleOrder) {
          saleOrder.updateTotalCost();
        }

      }

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

      $scope.imagesAll = false;

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
      vm.noMoreChildren = !children.length;

      if (!articleGroup) {
        vm.firstLevelGroups = vm.articleGroups;
      }

      setAncestors(articleGroup);
      setFirstLevelGroups(articleGroup);

      scrollArticlesTop();

      DEBUG('setCurrentArticleGroup', 'end');

      $state.go('.', {
        articleGroupId: filter.articleGroupId,
        q: vm.search,
        ordered: vm.showOnlyOrdered || null
      }, {notify: false});

    }


    function setFirstLevelGroups(currentArticleGroup) {

      DEBUG('setFirstLevelGroups', 'start');

      if (!currentArticleGroup || !vm.showFirstLevel) {
        DEBUG('setFirstLevelGroups', 'exit');
        vm.precedingGroups = [];
        vm.followingGroups = [];
        return;
      }

      if (!vm.firstLevelGroups) {

        let ownStock = getStockByArticlesOfGroup(null);
        let groupIds = articleGroupIds(ownStock);
        let childGroups = _.filter(ArticleGroup.getAll(), {articleGroupId: null});
        vm.firstLevelGroups = _.filter(childGroups, hasArticlesOrGroupsInStock(groupIds));

      }

      let currentFirstLevelGroup = currentArticleGroup.firstLevelAncestor();

      if (!currentFirstLevelGroup) {
        currentFirstLevelGroup = currentArticleGroup;
      }

      vm.precedingGroups = _.filter(vm.firstLevelGroups, group => group.name < currentFirstLevelGroup.name);
      vm.followingGroups = _.filter(vm.firstLevelGroups, group => group.name > currentFirstLevelGroup.name);

      DEBUG('setFirstLevelGroups', 'end');

    }


    function hasArticlesOrGroupsInStock(groupIds) {
      return articleGroup => {
        return groupIds[articleGroup.id]
          || articleGroup.hasDescendants(groupIds);
      }
    }

    function setAncestors(articleGroup) {

      vm.ancestors = [];

      if (articleGroup || vm.showOnlyOrdered) {
        vm.ancestors.push({displayName: 'Все товары', showAll: true});
      }

      if (vm.showOnlyOrdered) {
        vm.ancestors.push({displayName: 'Товары заказа', id: false});
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

      let groupIds = false;
      let articleIds = false;

      if (vm.showOnlyOrdered) {

        let ids = _.map(vm.saleOrder.positions, 'articleId');

        articleIds = groupIds = {};

        articles = _.filter(articles, article => {
          if (ids.indexOf(article.id) > -1) {
            groupIds[article.articleGroupId] = articleIds[article.id] = 1;
            return true;
          }
        });

      }

      if (articleGroup) {

        let hash = {};

        hash[articleGroup.id] = true;

        DEBUG('getStockByArticlesOfGroup', 'has articleGroup');

        _.each(articleGroup.descendantsCache, id => hash[id] = true);

        DEBUG('getStockByArticlesOfGroup', 'did hashing');

        articleIds = groupIds = {};

        articles = _.filter(articles, article => {

          if (hash[article.articleGroupId]) {
            groupIds[article.articleGroupId] = articleIds[article.id] = 1;
            return true;
          }
        });

      }

      if (vm.search || vm.filters.length) {

        let reg = vm.search && new RegExp(_.replace(_.escapeRegExp(vm.search), ' ', '.+'), 'i');

        if (vm.search === '**' && vm.saleOrder) {
          reg = false;
          vm.showOnlyShipped = true;
        } else {
          vm.showOnlyShipped = false;
        }

        let pieceVolume;

        _.each(vm.filters, filter => {
          if (filter.pieceVolume) {
            pieceVolume = parseFloat(filter.pieceVolume);
          }
        });

        let tags = _.filter(vm.filters, 'tag');

        articleIds = groupIds = {};

        _.each(articles, article => {

          let res = !reg ||
            reg.test(article.name) ||
            reg.test(article.preName) ||
            reg.test(article.lastName) ||
            article.ArticleGroup && reg.test(article.ArticleGroup.name);

          if (res && vm.showOnlyShipped && vm.articleStats) {
            res = vm.articleStats[article.id];
          }

          if (res && pieceVolume) {
            res = Math.abs(article.pieceVolume - pieceVolume) <= 0.051;
          }

          if (res && tags.length) {
            _.each(tags, tag => {
              res = res && _.find(article.tags, {code: tag.tag});
            });
          }

          if (res) {
            groupIds[article.articleGroupId] = articleIds[article.id] = 1;
          }

        });

      }

      DEBUG('getStockByArticlesOfGroup', 'articleIds');

      let result = !articleIds ? sortedStock : _.filter(sortedStock, stock => {
        if (articleIds[stock.articleId]) {
          return ++groupIds[stock.article.articleGroupId];
        }
      });

      result.articleGroupIds = groupIds;

      DEBUG('getStockByArticlesOfGroup', 'end');

      return result;
    }

    function articleGroupIds(stock) {

      if (stock.articleGroupIds) {
        return stock.articleGroupIds;
      }

      let res = {};

      _.each(stock, item => {
        let id = _.get(item, 'article.articleGroupId');
        let count = res[id] || 0;
        res[id] = ++count;
      });

      return res;

    }

    function alertCheck(stock) {

      if (!vm.genericAlertShown) {
        vm.genericAlertShown = true;
        _.each(vm.alertTriggers[null], trigger => trigger.show());
      }

      let id = stock.article && stock.article.articleGroupId;

      if (!id) return;

      let triggers = vm.alertTriggers[id];

      if (triggers) {
        _.each(triggers, trigger => trigger.show());
        delete vm.alertTriggers[id];
      }

    }

    // TODO: move to a separate helper

    function setRestrictions(salesmanId, outletId) {

      vm.restrictedArticles = {};

      if (!salesmanId || !outletId) {
        vm.restrictionsBy = {};
        return;
      }

      if (_.isEqual(vm.restrictionsBy, {salesmanId, outletId})) {
        return;
      }

      vm.restrictionsBy = {salesmanId, outletId};

      $q.all([
        OutletRestriction.findAll({outletId}, {cacheResponse: false}),
        SalesmanOutletRestriction.findAll({salesmanId, outletId}, {cacheResponse: false}),
        Restriction.findAll(),
        RestrictionArticle.uncachedFindAll({}, {limit: 10000})
      ])
        .then(res => {

          let restrictionIds = _.uniq(_.union(_.map(res[0], 'restrictionId'), _.map(res[1], 'restrictionId')));

          let restrictionArticles = res[3];

          _.map(restrictionArticles, ra => {
            let restrictionId = ra.restrictionId;
            if (restrictionIds.indexOf(restrictionId) === -1) return;
            vm.restrictedArticles[ra.articleId] = Restriction.get(restrictionId);
          });

          if (restrictionIds.length) {
            toastr.info(_.map(Restriction.getAll(restrictionIds), 'name').join(', '), 'Применены запреты');
          }

        })
        .catch(e => console.error(e));
    }

  }

  angular.module('Sales')
    .controller('CatalogueController', CatalogueController);

})();
