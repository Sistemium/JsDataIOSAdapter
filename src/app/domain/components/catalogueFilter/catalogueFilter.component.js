'use strict';

(function () {

  const LIMIT_TO = 10;

  angular.module('webPage').component('catalogueFilter', {

    bindings: {

      search: '=',
      filters: '=',
      activeTags: '=',
      activeGroup: '=',
      cvm: '=catalogueVm',

      removeTagClick: '='

    },

    templateUrl: 'app/domain/components/catalogueFilter/catalogueFilter.html',

    controller: catalogueFilterController,
    controllerAs: 'vm'

  });

  function catalogueFilterController($scope, Schema, saControllerHelper, $state) {

    const {SearchQuery, ArticleTagGroup} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({
      $onInit,

      queryClick,
      tagClick,
      initActiveGroupPropsClick,

      favouriteQueryClick,
      removeQueryClick,
      dummyTagClick,

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

      if (_.isEmpty(vm.searchQueries)) {
        return;
      }

      onSearchChange(nv);

    });

    function dummyTagClick(ev, tag) {

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

      SearchQuery.findAll()
        .then((res) => {

          res = _.orderBy(res, ['isFavourite', 'query'], ['desc', 'desc']);

          // let groups = _.groupBy(res, (item) => {
          //   return _.get(item, 'isFavourite') === true;
          // });

          vm.searchQueries = _.take(res, LIMIT_TO);

        });

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

