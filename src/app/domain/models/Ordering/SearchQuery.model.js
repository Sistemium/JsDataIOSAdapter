'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    const LIMIT_TO = 300;

    const SearchQuery = Schema.register({

      name: 'SearchQuery'

    });

    SearchQuery.on('DS.afterCreate', removeItemsToLimit);

    function removeItemsToLimit() {

      let destroyCount = SearchQuery.getAll().length - LIMIT_TO;

      if (destroyCount < 1) {
        return;
      }

      let notFavouriteFilter = {isFavourite: false, orderBy: 'lastUsed', limit: destroyCount};

      let toDestroy = SearchQuery.filter(notFavouriteFilter);

      _.each(toDestroy, item => item.DSDestroy());

    }


  });

})();
