'use strict';

(function () {

  angular.module('webPage').component('catalogueSearchInput', {

    bindings: {
      search: '=',
      filters: '=',
      searchEnterPress: '=',
      activeTags: '=',
      activeGroup: '=',
      cvm: '=catalogueVm',
      removeTagClick: '=',
      inputClick: '&',
      focused: '=?',
      labelClick: '&',

      stockLength: '<',
      onSearchEnter: '&'

    },

    templateUrl: 'app/domain/sales/catalogue/catalogueSearchInput/catalogueSearchInput.html',

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

      search: $state.params.q || '',
      filterRemovers,
      onFocus

    });

    $scope.$watch('vm.search', nv => {

      runDebounce(nv);

    });

    function filterRemovers() {
      // TODO: implement volume filters with a dynamic ArticleTagGroup then remove this stuff from the component
      return _.filter(vm.filters, 'pieceVolume');
    }

    function $onInit() {

      SearchQuery.bindAll({
        orderBy: 'query'
      }, $scope, 'vm.searchQueries');

    }

    function saveQuery(val = '') {

      val = _.trim(val).toLocaleLowerCase();

      let searchQuery = _.find(vm.searchQueries, {query: val});

      if (!searchQuery) {

        let instance = SearchQuery.createInstance({
          query: val,
          lastUsed: moment().toDate(),
          cnt: 1,
          isFavourite: false
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

    function onFocus(focused) {

      vm.focused = focused;

    }

  }

}());
