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
      priceSlider: '='

    },

    templateUrl: 'app/domain/sales/catalogue/catalogueFilter/catalogueFilter.html',

    controller: catalogueFilterController,
    controllerAs: 'vm'

  });

  const LS_KEY = 'catalogueFilter.tabsOpen';

  function catalogueFilterController($scope, Schema, saControllerHelper, $state, localStorageService) {

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

      search: $state.params.q || '',
      currentSearchQuery: null,
      tabsOpen: localStorageService.get(LS_KEY) || {categories: true},

      priceSlider: {
        min: 0,
        max: 25000,
        options: {
          noSwitching: true,
          floor: 0,
          ceil: 25000,
          step: 25,
          customValueToPosition,
          customPositionToValue,
          translate: translateSlider
        }
      }

    });

    vm.watchScope('vm.tabsOpen', nv => {
      if (nv) {
        localStorageService.set(LS_KEY, nv);
      }
    }, true);

    $scope.$watch('vm.search', nv => {

      if (_.isEmpty(vm.searchQueries)) {
        return;
      }

      onSearchChange(nv);

    });

    /*
    Functions
     */

    const pow = 4;

    function power(val) {
      return Math.pow(val, pow);
    }

    function root(val) {
      return Math.pow(val, 1/pow);
    }

    function customValueToPosition() {

      let [val, minVal, maxVal] = _.map(arguments, root);

      let range = maxVal - minVal;
      return (val - minVal) / range;

    }

    function customPositionToValue(percent, minVal, maxVal) {
      minVal = root(minVal);
      maxVal = root(maxVal);
      let value = percent * (maxVal - minVal) + minVal;
      return power(value);
    }

    function translateSlider(value, sliderId, label) {
      switch (label) {
        case 'model':
          return `Цена от ${value}`;
        case 'high':
          return `до ${value} ₽`;
        default:
          return `${value}`
      }
    }

    function removeTagClick(tag) {

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

      const savedQuery = _.find(vm.searchQueries, {query: nv});

      if (savedQuery) {
        vm.currentSearchQuery = savedQuery.query;
      } else {
        vm.currentSearchQuery = null;
      }
    }

    function $onInit() {

      SearchQuery.findAll();

      let filter = {
        orderBy: [['isFavourite', 'DESC'], ['query', 'ASC']]
      };

      vm.rebindAll(SearchQuery, filter, 'vm.searchQueries');

      vm.articleTagGroups = ArticleTagGroup.getAll();

    }

    function favouriteQueryClick(query) {

      query.isFavourite = _.get(query, 'isFavourite') !== true;
      SearchQuery.save(query);

    }

    function removeQueryClick(searchQuery) {

      let {query} = searchQuery;

      if (query === vm.currentSearchQuery) {
        vm.currentSearchQuery = null;

        if (vm.search === query) {
          vm.search = null;
        }

      }

      SearchQuery.destroy(searchQuery);

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

    function saveQuery(val) {

      let searchQuery = _.find(vm.searchQueries, {query: val});

      searchQuery.cnt++;
      searchQuery.lastUsed = moment().toDate();
      SearchQuery.create(searchQuery);

    }

    function queryClick(query) {

      let queryStr = _.get(query, 'query');

      if (vm.currentSearchQuery === queryStr) {
        vm.search = vm.currentSearchQuery = null;
      } else {
        saveQuery(queryStr);
        vm.search = vm.currentSearchQuery = queryStr;
      }

    }

    function setFilters() {
      vm.filters = _.flatten(_.map(vm.activeTags, groupTags => _.map(groupTags)));
    }

  }

}());

