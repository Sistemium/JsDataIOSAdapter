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

  function catalogueSearchInputController($scope, Schema, saControllerHelper, $state, saEtc) {

    const {SearchQuery} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      $onInit,

      clearSearchClick,

      search: $state.params.q || '',
      filterRemovers,
      onFocus

    });

    $scope.$watch('vm.search', saEtc.debounce(saveQuery, 2000, $scope));

    function filterRemovers() {
      // TODO: implement volume filters with a dynamic ArticleTagGroup then remove this stuff from the component
      return _.filter(vm.filters, 'pieceVolume');
    }

    function $onInit() {

      // SearchQuery.bindAll({
      //   orderBy: 'query'
      // }, $scope, 'vm.searchQueries');

    }

    const spacesRe = /[ ]/g;

    function spacesCountIn(val) {

      return _.get(val.match(spacesRe), 'length') || 0;

    }

    function saveQuery(val) {

      val = _.trim(val).toLocaleLowerCase();

      if (!val || val.length < 3 || !vm.stockLength) {
        return;
      }

      let spaceCount = spacesCountIn(val);

      let matching = _.filter(SearchQuery.getAll(), sq => {
        let {query, isFavourite} = sq;
        return isFavourite ? query === val : _.startsWith(val, query) && spaceCount === spacesCountIn(query);
      });

      let searchQuery = _.maxBy(matching, 'query.length');

      if (!searchQuery) {

        searchQuery = SearchQuery.createInstance({
          cnt: 0,
          isFavourite: false
        });

      }

      _.assign(searchQuery, {
        query: val,
        lastUsed: moment().toDate()
      });

      searchQuery.cnt++;
      SearchQuery.create(searchQuery);

    }

    function clearSearchClick() {
      vm.search = null;
    }

    function onFocus(focused) {

      vm.focused = focused;

    }

  }

}());
