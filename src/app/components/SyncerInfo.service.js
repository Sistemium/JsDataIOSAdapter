(function (module) {

  module.service('SyncerInfo', SyncerInfo);

  function SyncerInfo($window, $timeout, IOS) {

    const CALLBACK = 'unsyncedInfoCallback';
    const syncerState = {};

    $timeout(3000)
      .then(() => bind(status => $timeout(() => stateInfoCallback(status))));

    return {
      watch
    };

    function bind(callback) {

      $window[CALLBACK] = function (obj) {
        if (_.isFunction(callback)) {
          callback(obj);
        }
      };

      if (IOS.isIos()) {
        IOS.handler('unsyncedInfoService').postMessage({
          unsyncedInfoCallback: CALLBACK
        });
        return true;
      }

    }


    function stateInfoCallback(state) {

      let status = _.first(state);

      let isSending = status === 'syncerIsSendingData';
      let hasUnsynced = isSending || status === 'haveUnsyncedObjects';

      _.assign(syncerState, {
        isSending, hasUnsynced
      });

      // console.warn(syncerState, state, status);

    }

    function watch(scope, callback) {
      let unwatch = scope.$watch(() => syncerState, callback, true);
      scope.$on('$destroy', unwatch);
    }

  }

})(angular.module('core.services'));
