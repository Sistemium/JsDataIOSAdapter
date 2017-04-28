(function (module) {

  module.service('SyncerInfo', $window => {

    function bind(callback) {

      function unsyncedInfoCallback(obj) {
        callback(obj);
      }

      $window.unsyncedInfoCallback = unsyncedInfoCallback;

      let webkit = $window.webkit;

      if (webkit) {
        webkit.messageHandlers.unsyncedInfoService.postMessage({
          unsyncedInfoCallback: 'unsyncedInfoCallback'
        });
        return true;
      }

    }

    const syncerState = {};

    function stateInfoCallback(state) {
      _.assign(syncerState, {
        hasUnsynced:_.first(state) === 'haveUnsyncedObjects'
      });
    }

    function watch(scope, callback) {
      let unwatch = scope.$watch(() => syncerState, callback, true);
      scope.$on('$destroy', unwatch);
    }

    bind(stateInfoCallback);

    return {
      watch
    };

  });

})(angular.module('core.services'));
