'use strict';

(function () {

  angular.module('webPage').component('catalogueFilter', {

    bindings: {

      search: '=',
      filters: '=',
      activeTags: '=',
      activeGroup: '=',
      cvm: '=catalogueVm',

      removeTagClick: '=',
      priceSlider: '=',
      clearFilters: '=',
      showSearchHistory: '=',
      showSettings: '='

    },

    templateUrl: 'app/domain/sales/catalogue/catalogueFilter/catalogueFilter.html',

    controller: catalogueFilterController,
    controllerAs: 'vm'

  });

  const LS_KEY = 'catalogueFilter.tabsOpen';
  const LS_SETTINGS_KEY = 'catalogueFilter.showFilters';

  function catalogueFilterController($scope, Schema, saControllerHelper,
                                     $state, localStorageService, saEtc,
                                     saMedia) {

    const {SearchQuery, Article, ArticleTagGroup, ArticleTag} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({
      $onInit,

      queryClick,
      tagClick,
      favouriteQueryClick,
      removeQueryClick,
      activeTagClick,
      ancestorGroups,
      removeTagClick,
      clearFilters,
      groupHasActiveTags,
      activeArticleGroupClick,
      articleGroupClick,
      searchInputToggleOpenClick,
      onSearchEnter,
      needShowCurrentArticleGroup,
      toggleFavouriteClick,
      settingValue,
      settingToggleClick,

      search: $state.params.q || '',
      showFirstLevel: true,

      tabsOpen: localStorageService.get(LS_KEY) || {categories: true},
      settings: localStorageService.get(LS_SETTINGS_KEY) || {},

      priceSlider: {
        min: 0,
        max: 25000,
        options: {
          noSwitching: true,
          floor: 0,
          ceil: 25000,
          step: 1,
          customValueToPosition: sliderValueToPosition,
          customPositionToValue: sliderPositionToValue,
          translate: sliderTranslate
        },

        hasFilter: sliderHasFilter
      }

    });

    const debouncedSearch = saEtc.debounce(setCatalogueSearch, 1000, $scope);

    vm.watchScope('vm.tabsOpen', nv => {
      if (nv) {
        localStorageService.set(LS_KEY, nv);
      }
    }, true);

    vm.watchScope('vm.searchText', onSearchChange);
    vm.watchScope('vm.search', nv => {
      if (!nv) {
        vm.searchText = '';
        setFilters();
      }
    });

    vm.watchScope('vm.searchFocused', onSearchFocus);
    vm.watchScope('vm.tabsOpen.queries', (nv, ov) => (ov && !nv || !ov && nv) && setFilters());

    vm.watchScope(
      () => saMedia.xxsWidth || saMedia.xsWidth,
      nv => {
        vm.isPhone = !!nv;
        // console.warn('vm.isPhone', vm.isPhone);
      }
    );


    /*
    Functions
     */

    function words() {
      return Article.meta.words();
    }

    function setCatalogueSearch() {
      vm.search = _.trim(vm.searchText);
    }

    function onSearchEnter() {
      vm.filters = [];
      vm.activeTags = {};
      vm.cvm.currentArticleGroup = false;
      vm.priceSlider.min = 0;
      vm.priceSlider.max = vm.priceSlider.options.ceil;
      setCatalogueSearch();
      vm.cvm.articleGroupClick();
    }

    function activeArticleGroupClick($event) {
      // vm.cvm.currentArticleGroup = null;
      $event.stopPropagation();
      vm.cvm.articleGroupClick();
    }

    const pow = 4;

    function sliderPower(val) {
      return Math.pow(val, pow);
    }

    function sliderBrake(val) {
      return Math.pow(val, 1 / pow);
    }

    function sliderValueToPosition() {

      let [val, minVal, maxVal] = _.map(arguments, sliderBrake);
      let range = maxVal - minVal;

      return (val - minVal) / range;

    }

    function sliderPositionToValue(percent, minVal, maxVal) {

      minVal = sliderBrake(minVal);
      maxVal = sliderBrake(maxVal);

      let value = percent * (maxVal - minVal) + minVal;

      return sliderPower(value);

    }

    function sliderTranslate(value, sliderId, label) {

      switch (label) {
        case 'model':
          return `Цена от ${value}`;
        case 'high':
          return `до ${value} ₽`;
        default:
          return `${value}`
      }

    }

    function sliderHasFilter() {
      return this.min > 0 || this.max < this.options.ceil;
    }

    function onSearchFocus(focused) {

      if (!vm.showSearchHistory) {
        return;
      }

      if (focused) {
        // vm.fullScreen = true;
        vm.tabsOpen.queries = true;
      } else {
        // setFilters();
      }

    }

    function removeTagClick(tag) {

      if (tag.pieceVolume) {
        return _.remove(vm.filters, 'pieceVolume');
      }

      if (tag.isSearch) {
        vm.search = '';
        return _.remove(vm.filters, 'isSearch');
      }

      tagClick(tag);

    }

    function ancestorGroups() {

      let {ancestors} = vm.cvm;

      if (!vm.cvm.currentArticleGroup && vm.cvm.showOnlyOrdered) {
        return [_.first(ancestors)];
      }

      if (vm.cvm.precedingGroups && vm.showFirstLevel) {
        return _.slice(ancestors, 1);
      }

      return ancestors;

    }

    function activeTagClick(ev, tag) {

      ev.stopPropagation();

      vm.removeTagClick(tag);

    }

    function onSearchChange(nv) {

      nv = _.trim(nv).toLocaleLowerCase();

      filterVisibleQueries(nv);

      vm.currentSearchQuery = getSearchQuery(nv);

      debouncedSearch();

    }

    function filterVisibleQueries(text) {

      text = _.trim(text).toLocaleLowerCase();

      let searchQueries = _.filter(vm.allSearchQueries, sq => {
        return sq.isFavourite && (text ? _.startsWith(sq.query, text) : sq.isFavourite);
      });

      if (!text) {
        vm.searchQueries = searchQueries;
        return;
      }

      let res = [];

      _.each(_.get(words(), text[0]), query => {

        if (!_.startsWith(query, text)) {
          return;
        }

        let existing = _.find(searchQueries, {query});

        if (existing) {
          if (existing.isFavourite) {
            return;
          }
          _.remove(searchQueries, existing);
        } else {
          existing = {query};
        }

        res.push(existing);

      });

      Array.prototype.push.apply(searchQueries, res);

      vm.searchQueries = searchQueries;

    }

    function $onInit() {

      SearchQuery.findAll()
        .catch(() => {
          SearchQuery.adapter = 'localStorage';
          return SearchQuery.findAll({}, {bypassCache: true});
        });

      let filter = {
        orderBy: [['isFavourite', 'DESC'], ['query', 'ASC']]
      };

      vm.rebindAll(SearchQuery, filter, 'vm.allSearchQueries', () => {
        filterVisibleQueries(vm.searchText);
      });

      vm.articleTagGroups = ArticleTagGroup.getAll();

    }

    function favouriteQueryClick(query) {

      query = query.id ? query : getSearchQuery(query.query);

      query.isFavourite = _.get(query, 'isFavourite') !== true;

      if (!query.isFavourite && !vm.searchText) {
        vm.search = '';
      }

      SearchQuery.create(query);

    }

    function getSearchQuery(searchText) {

      let query = searchText;
      let searchQuery = _.find(SearchQuery.getAll(), {query});

      if (!searchQuery) {
        searchQuery = SearchQuery.createInstance({
          cnt: 0,
          query,
          lastUsed: moment().toDate()
        });
      }

      return searchQuery;

    }

    function toggleFavouriteClick() {

      let query = vm.searchText;
      let searchQuery = _.find(SearchQuery.getAll(), {query});

      if (!searchQuery) {
        searchQuery = {
          cnt: 0,
          query
        }
      }

      searchQuery.isFavourite = !searchQuery.isFavourite;
      searchQuery.lastUsed = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

      vm.currentSearchQuery = searchQuery;

      SearchQuery.create(searchQuery);

    }

    function removeQueryClick(searchQuery) {

      let {query} = searchQuery;

      if (vm.search && vm.search.toLocaleLowerCase() === query) {
        vm.search = null;
      }

      if (searchQuery.id) {
        SearchQuery.destroy(searchQuery);
      }

    }

    function groupHasActiveTags(tagGroup) {
      return Object.keys(vm.activeTags[tagGroup.id] || {}).length;
    }

    function tagClick(tag) {

      if (!tag.id && tag.code) {
        tag = ArticleTag.get(tag.code);
      }

      let {groupId = '_', id = tag.label, group = {}, label} = tag;

      let {allowMultiple} = group;

      let groupData = vm.activeTags[groupId] || {};

      let newData = allowMultiple ? groupData : {};

      if (groupData[id] || _.find(vm.filters, {label})) {
        delete newData[id];
      } else {
        newData[id] = tag;
      }

      vm.activeTags[groupId] = newData;

      setFilters();

    }

    function saveQuery(searchQuery) {

      searchQuery.cnt = (parseInt(searchQuery.cnt) || 0) + 1;

      // This is to fix overflow problem caused by iSistemiumCore json serializer bug
      if (searchQuery.cnt > 100000) {
        searchQuery.cnt = 1;
      }

      searchQuery.lastUsed = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
      SearchQuery.create(searchQuery);

    }

    function queryClick(query) {

      let queryStr = _.get(query, 'query');

      if (vm.search === queryStr) {
        vm.search = vm.searchText;
      } else {
        vm.fullScreen = false;
        saveQuery(query);
        onSearchEnter();
        vm.search = queryStr;
      }

      setFilters();

    }

    function shouldShowSearchAsFilter() {
      return vm.search && vm.searchText !== vm.search &&
        (!vm.tabsOpen.queries || vm.isPhone && !vm.fullScreen);
    }

    function setFilters() {

      let pieceVolume = _.find(vm.filters, 'pieceVolume');
      let filters = _.flattenDeep([_.map(vm.activeTags, groupTags => _.map(groupTags)), pieceVolume]);

      if (shouldShowSearchAsFilter()) {
        filters.push({label: vm.search, isSearch: true, cls: 'search'});
      }

      vm.filters = _.filter(filters);

    }

    function clearFilters() {
      vm.filters = [];
      vm.activeTags = {};
      vm.cvm.currentArticleGroup = false;
      vm.search = '';
      vm.searchText = '';
      vm.priceSlider.min = 0;
      vm.priceSlider.max = vm.priceSlider.options.ceil;
    }

    function articleGroupClick(articleGroup) {

      let currentId = _.get(vm.cvm, 'currentArticleGroup.id');

      if (articleGroup && articleGroup.id === currentId) {
        articleGroup = articleGroup.articleGroup;
      }

      vm.cvm.articleGroupClick(articleGroup);

      if (!articleGroup) {
        return;
      }

      if (!_.get(vm, 'cvm.articleGroups.length') || !articleGroup.children.length) {
        vm.fullScreen = false;
      }

    }

    function searchInputToggleOpenClick() {
      vm.tabsOpen.queries = !vm.tabsOpen.queries;
      vm.fullScreen = true;
    }

    function needShowCurrentArticleGroup() {
      return !vm.cvm.noMoreChildren && vm.cvm.currentArticleGroup && vm.cvm.currentArticleGroup.displayName ||
        !vm.cvm.currentArticleGroup && vm.cvm.showOnlyOrdered ||
        vm.cvm.currentArticleGroup && !vm.cvm.articleGroups;
    }

    function settingToggleClick(id, $event) {

      _.set(vm.settings, id, !settingValue(id));

      $event.stopPropagation();

      localStorageService.set(LS_SETTINGS_KEY, vm.settings);

    }

    function settingValue(id) {

      return _.get(vm.settings, id);

    }

  }

}());

