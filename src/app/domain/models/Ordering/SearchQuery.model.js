'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    const LIMIT_TO = 10;

    const SearchQuery = Schema.register({

      name: 'SearchQuery'

    });

    SearchQuery.on('DS.afterCreate', removeItemsToLimit);

    function removeItemsToLimit() {

      let notFavouriteFilter = {isFavourite: false, orderBy: 'lastUsed'};

      let notFavourites = SearchQuery.filter(notFavouriteFilter);

      let destroyCount = notFavourites.length - LIMIT_TO;

      if (destroyCount < 1) {
        return;
      }

      let toDestroy = _.take(notFavourites, destroyCount);

      _.each(toDestroy, item => item.DSDestroy());

    }


  });

})();
