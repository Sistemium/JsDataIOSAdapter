(function (module) {

  module.service('SyncerInfo', SyncerInfo);

  function SyncerInfo($window, $timeout) {

    const CALLBACK = 'unsyncedInfoCallback';
    const syncerState = {};

    bind(status => $timeout(() => stateInfoCallback(status)));

    return {
      watch
    };

    function bind(callback) {

      $window[CALLBACK] = function (obj) {
        if (_.isFunction(callback)) {
          callback(obj);
        }
      };

      let webkit = $window.webkit;

      if (webkit) {
        webkit.messageHandlers.unsyncedInfoService.postMessage({
          unsyncedInfoCallback: CALLBACK
        });
        return true;
      }

    }


    function stateInfoCallback(state) {
      _.assign(syncerState, {
        hasUnsynced: _.first(state) === 'haveUnsyncedObjects'
      });
    }

    function watch(scope, callback) {
      let unwatch = scope.$watch(() => syncerState, callback, true);
      scope.$on('$destroy', unwatch);
    }

  }

})(angular.module('core.services'));
