(function () {

  angular.module('sistemium.services')
    .service('RelationLoader', RelationLoader);

  function RelationLoader() {


    return init;

    function init(relationName, orderBy = false) {

      let cache = {};

      return {
        refreshCache,
        lazyItems
      };


      function refreshCache(item) {
        delete cache[item.id];
        lazyItems(item);
      }

      function lazyItems(item) {

        let cached = cache[item.id];

        if (!cached) {

          cache[item.id] = [];

          item.DSLoadRelations(relationName)
            .then(res => cache[item.id] = _.orderBy(res[relationName], orderBy));

        }

        return cache[item.id];

      }

    }

  }


})();
