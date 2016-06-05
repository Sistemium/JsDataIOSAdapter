'use strict';

(function () {

  function routerAuth ($rootScope,Auth) {

    function init () {

      $rootScope.$on('$destroy',$rootScope.$on('$stateChangeStart', function (event, next, nextParams) {

        var needRoles = _.get(next, 'data.needRoles');

        if (needRoles && Auth.isAuthorized(needRoles)) {
          event.preventDefault();
        }

        console.error('routerAuth:', next, nextParams, needRoles);

      }));

    }

    return {
      init: init
    };

  }

  angular.module('core.services')
    .service('routerAuth', routerAuth);

})();
