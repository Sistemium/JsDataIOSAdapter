'use strict';

(function () {

  const LIMIT_TO = 20;

  angular.module('webPage').component('catalogueSearchInput', {

    bindings: {
      search: '=',
      filters: '=',
      searchEnterPress: '=',
      activeTags: '=',
      activeGroup: '=',

      stockLength: '<',

      onLabelClick: '&'
    },

    templateUrl: 'app/domain/components/catalogueSearchInput/catalogueSearchInput.html',

    controller: catalogueSearchInputController,
    controllerAs: 'vm'

  });

  function catalogueSearchInputController($scope, Schema, saControllerHelper, $state) {

    const {SearchQuery} = Schema.models();

    const runDebounce = _.debounce(delayedSave, 1000);

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      $onInit,

      clearSearchClick,
      onSearchEnter,
      removeTagClick,

      search: $state.params.q || ''

    });

    $scope.$watch('vm.search', nv => {

      runDebounce(nv);

    });

    function $onInit() {

      SearchQuery.findAll();

      SearchQuery.bindAll({
        orderBy: 'query',
        limit: LIMIT_TO
      }, $scope, 'vm.searchQueries');

    }

    function saveQuery(val) {

      let searchQuery = _.find(vm.searchQueries, {query: val});

      if (!searchQuery) {

        let instance = SearchQuery.createInstance({
          query: val,
          lastUsed: moment().toDate(),
          cnt: 1
        });

        SearchQuery.create(instance);

      } else {

        searchQuery.cnt++;
        searchQuery.lastUsed = moment().toDate();
        SearchQuery.create(searchQuery);

      }

    }

    function delayedSave(nv) {

      if (nv && nv.length > 2 && vm.stockLength) {
        saveQuery(nv);
      }

    }

    function clearSearchClick() {
      vm.search = null;
    }

    function onSearchEnter() {
      vm.searchEnterPress = true;
    }

    function removeTagClick(tag) {

      let {label} = tag;

      _.each(vm.activeTags, (val, key) => {
        if (val === label) {

          let activeGroupKey = key;

          //TODO: hardcoded other group's values

          if (activeGroupKey === 'gift' || activeGroupKey === 'sparkling') {
            activeGroupKey = 'other'
          }

          _.pull(vm.activeGroup[activeGroupKey].selected, label);

          if (!vm.activeGroup[activeGroupKey].selected.length) {
            vm.activeGroup[activeGroupKey].cnt = false;
          }

          vm.activeTags = _.omit(vm.activeTags, key);
          return false;

        }
      });

      _.remove(vm.filters, _.find(vm.filters, {label: label}));

    }

  }

}());

