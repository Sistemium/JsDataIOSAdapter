'use strict';

(function () {

  const LIMIT_TO = 20;

  angular.module('webPage').component('advancedFilter', {

    bindings: {

      search: '=',
      filters: '=',
      activeTags: '=',
      activeGroup: '='

    },

    templateUrl: 'app/domain/components/advancedFilter/advancedFilter.html',

    controller: advancedFilterController,
    controllerAs: 'vm'

  });

  function advancedFilterController($scope, Schema, saControllerHelper, $state) {

    const {SearchQuery, ArticleTagGroup} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({
      $onInit,

      queryClick,
      tagClick,
      initActiveGroupPropsClick,

      favouriteQueryClick,
      removeQueryClick,

      search: $state.params.q || '',
      currentSearchQuery: null

    });

    $scope.$watchCollection('vm.searchQueries', (n, o) => {

      if (!n || !o) {
        return;
      }

      if (n.length - 1 === o.length) {
        let queries = _.orderBy(n, 'lastUsed', 'desc');
        vm.currentSearchQuery = _.get(queries[0], 'query');
      }

    });

    $scope.$watch('vm.search', nv => {

      const savedQuery = _.find(vm.searchQueries, {query: nv});

      if (savedQuery) {
        vm.currentSearchQuery = savedQuery.query;
      } else {
        vm.currentSearchQuery = null;
      }

    });

    function $onInit() {

      SearchQuery.findAll();

      vm.articleTagGroups = ArticleTagGroup.getAll();

      SearchQuery.bindAll({
        orderBy: 'query',
        limit: LIMIT_TO
      }, $scope, 'vm.searchQueries');

    }

    function favouriteQueryClick(query) {

      query.favourited = _.get(query, 'favourited') !== true;
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

    function initActiveGroupPropsClick(groupId) {

      if (!_.get(vm.activeGroup, groupId)) {
        vm.activeGroup[groupId] = {};
      }

      if (!_.get(vm.activeGroup[groupId], 'selected')) {
        vm.activeGroup[groupId].selected = [];
      }

    }

    function tagClick(arg, allowMultiple) {

      let {groupId, label, id} = arg;

      let normalGroupId = groupId;

      if (allowMultiple) {
        groupId = id;
      }

      if (vm.activeTags[groupId] === label) {

        vm.activeTags = _.omit(vm.activeTags, groupId);
        _.remove(vm.filters, {code: id});

        _.pull(vm.activeGroup[normalGroupId].selected, label);

        if (!vm.activeGroup[normalGroupId].selected.length) {
          vm.activeGroup[normalGroupId].cnt = false;
        }

      } else {

        if (allowMultiple) {
          vm.activeGroup[normalGroupId].selected.push(label);
        } else {
          vm.activeGroup[normalGroupId].selected = [label];
        }

        if (!allowMultiple) {
          _.remove(vm.filters, {label: vm.activeTags[groupId]});
        }

        vm.filters.push({code: id, label: label});
        vm.activeTags[groupId] = label;

      }

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

  }

}());

