'use strict';

(function () {

  angular.module('webPage').component('catalogueSearchInput', {

    bindings: {
      search: '=',
      filters: '=',
      stockLength: '<',
      searchEnterPress: '='
    },

    templateUrl: 'app/domain/components/catalogueSearchInput/catalogueSearchInput.html',

    controller: catalogueSearchInputController,
    controllerAs: 'vm'

  });

  function catalogueSearchInputController($scope, Schema, saControllerHelper) {

    const {SearchQuery} = Schema.models();

    $scope.$watch('vm.search', _.debounce((nv) => {

      if (nv.length > 2 && vm.stockLength) {

        if (!_.find(vm.searchQueries, {query: nv})) {

          let instance = SearchQuery.createInstance({query: nv, lastUsed: moment(), cnt: 1});

          vm.searchQueries.push(instance);

          SearchQuery.create(instance);

        }

      }

    }, 1000));

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({
      clearSearchClick,
      removeFilterClick,
      onSearchEnter,
      $onInit
    });

    function $onInit() {

      SearchQuery.findAll().then((res) => {
        vm.searchQueries = res;
      });

    }

    function clearSearchClick() {
      vm.search = null;
    }

    function onSearchEnter() {
      vm.searchEnterPress = true;
    }

    function removeFilterClick(filter) {

      if (_.find(vm.filters, filter)) {
        _.remove(vm.filters, filter);
      }

    }

  }

}());

