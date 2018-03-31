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
      showSearchHistory: '='

    },

    templateUrl: 'app/domain/sales/catalogue/catalogueFilter/catalogueFilter.html',

    controller: catalogueFilterController,
    controllerAs: 'vm'

  });

  const LS_KEY = 'catalogueFilter.tabsOpen';

  function catalogueFilterController($scope, Schema, saControllerHelper, $state, localStorageService, saEtc) {

    const {SearchQuery, ArticleTagGroup, ArticleTag} = Schema.models();

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

      search: $state.params.q || '',
      tabsOpen: localStorageService.get(LS_KEY) || {categories: true},

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
      }
    });

    vm.watchScope('vm.searchFocused', onSearchFocus);

    /*
    Functions
     */

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
        // setCatalogueSearch();
      }

    }

    function removeTagClick(tag) {

      if (tag.pieceVolume) {
        return _.remove(vm.filters, 'pieceVolume');
      }

      tagClick(tag);

    }

    function ancestorGroups() {

      let {ancestors} = vm.cvm;

      if (!vm.cvm.currentArticleGroup && vm.cvm.showOnlyOrdered) {
        return [_.first(ancestors)];
      }

      if (vm.cvm.precedingGroups && vm.cvm.showFirstLevel) {
        return _.slice(ancestors, 1);
      }

      return ancestors;

    }

    function activeTagClick(ev, tag) {

      ev.stopPropagation();

      vm.removeTagClick(tag);

    }

    function onSearchChange(nv) {

      filterVisibleQueries(_.trim(nv).toLocaleLowerCase());

      debouncedSearch();

    }

    function filterVisibleQueries(text) {

      vm.searchQueries = _.filter(vm.allSearchQueries, sq => {
        return text ? _.startsWith(sq.query, text) : sq.isFavourite;
      });

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

      query.isFavourite = _.get(query, 'isFavourite') !== true;
      SearchQuery.save(query);

    }

    function removeQueryClick(searchQuery) {

      let {query} = searchQuery;

      if (vm.search && vm.search.toLocaleLowerCase() === query) {
        vm.search = null;
      }

      SearchQuery.destroy(searchQuery);

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

      searchQuery.cnt++;
      searchQuery.lastUsed = moment().toDate();
      SearchQuery.create(searchQuery);

    }

    function queryClick(query) {

      let queryStr = _.get(query, 'query');

      if (vm.search === queryStr) {
        vm.search = null;
      } else {
        vm.fullScreen = false;
        saveQuery(query);
        onSearchEnter();
        vm.search = queryStr;
      }

    }

    function setFilters() {
      let pieceVolume = _.find(vm.filters, 'pieceVolume');
      let filters = _.flattenDeep([_.map(vm.activeTags, groupTags => _.map(groupTags)), pieceVolume]);
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

      vm.cvm.articleGroupClick(articleGroup);

      if (articleGroup && !_.get(vm, 'cvm.articleGroups.length') || !articleGroup.children.length) {
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

  }

}());

