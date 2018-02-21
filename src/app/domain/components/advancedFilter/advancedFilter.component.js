'use strict';

(function () {

  const LIMIT_TO = 20;

  angular.module('webPage').component('advancedFilter', {

    bindings: {

      search: '=',
      filters: '=',
      activeTags: '='

    },

    templateUrl: 'app/domain/components/advancedFilter/advancedFilter.html',

    controller: advancedFilterController,
    controllerAs: 'vm'

  });

  function advancedFilterController($scope, Schema, saControllerHelper, $state) {

    const {SearchQuery, ArticleTag} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({
      $onInit,

      queryClick,
      tagClick,

      search: $state.params.q || '',
      currentSearchQuery: null,

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

      vm.newTags = _.groupBy(ArticleTag.meta.tags, item => {
        return item[3];
      });

      SearchQuery.bindAll({
        orderBy: 'query',
        limit: LIMIT_TO
      }, $scope, 'vm.searchQueries');

    }

    function tagClick(arg) {

      let key = arg[3] ? arg[3] : arg[0];

      if (vm.activeTags[key] === arg[1]) {
        vm.activeTags = _.omit(vm.activeTags, key);
        _.remove(vm.filters, {code: arg[0]});
      } else {

        if (key === arg[3]) {
          _.remove(vm.filters, {label: vm.activeTags[key]});
        }

        vm.filters.push({code: arg[0], label: arg[1]});

        vm.activeTags[key] = arg[1];

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

