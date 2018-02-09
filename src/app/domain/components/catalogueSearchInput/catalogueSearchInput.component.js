'use strict';

(function () {

  const LIMIT_TO = 20;

  angular.module('webPage').component('catalogueSearchInput', {

    bindings: {
      search: '=',
      filters: '=',
      stockLength: '<',
      searchEnterPress: '=',
      saveTagFn: '&',
      toggleFilterFn: '&',
      searchTags: '<'
    },

    templateUrl: 'app/domain/components/catalogueSearchInput/catalogueSearchInput.html',

    controller: catalogueSearchInputController,
    controllerAs: 'vm'

  });

  function catalogueSearchInputController($scope, Schema, saControllerHelper, $state) {

    const {SearchQuery} = Schema.models();

    const runDebounce = _.debounce(delayedSave, 1000);

    $scope.$watch('vm.search', nv => {

      const savedQuery = _.find(vm.searchQueries, {query: nv});

      if (savedQuery) {
        vm.currentSearchQuery = savedQuery.query;
      } else {
        vm.currentSearchQuery = null;
      }

      runDebounce(nv);

    });

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({
      $onInit,

      clearSearchClick,
      removeTagClick,
      queryClick,
      tagClick,

      onSearchEnter,

      search: $state.params.q || '',
      currentSearchQuery: null

    });

    function $onInit() {
      SearchQuery.findAll().then(res => vm.searchQueries = _.take(_.orderBy(res, 'cnt', 'desc'), LIMIT_TO));
    }

    function saveQuery(val) {
      let searchQuery = _.find(vm.searchQueries, {query: val});

      if (!searchQuery) {

        let instance = SearchQuery.createInstance({
          query: val,
          lastUsed: moment().toDate(),
          cnt: 1
        });

        vm.searchQueries.push(instance);

        SearchQuery.create(instance).then((res) => {
          vm.currentSearchQuery = res;
        });

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

    function queryClick(query) {

      if (vm.currentSearchQuery === query.query) {
        vm.search = vm.currentSearchQuery = null;
      } else {
        vm.search = vm.currentSearchQuery = query.query;
      }

    }

    function tagClick(tag) {

      let tagInArray = _.find(vm.filters, {label: tag.label});

      if (!tagInArray) {

        let volumeRegExp = /^\d?\.?\d+л$/;

        let codeName = volumeRegExp.test(tag.label) ? 'pieceVolume' : 'code';

        if (codeName === 'pieceVolume') {
          let existingVolumeFilter = _.find(vm.filters, el => volumeRegExp.test(el.label));

          if (existingVolumeFilter) {
            vm.toggleFilterFn()(existingVolumeFilter);
          }
        }

        vm.toggleFilterFn()({[codeName]: tag.code, 'label': tag.label});

        vm.saveTagFn()(tag);

      } else {
        vm.toggleFilterFn()(tagInArray);
      }

    }

    function clearSearchClick() {
      vm.search = null;
      vm.currentSearchQuery = null;
    }

    function onSearchEnter() {
      vm.searchEnterPress = true;
    }

    function removeTagClick(tag) {
      vm.toggleFilterFn()(tag);
    }

  }

}());

