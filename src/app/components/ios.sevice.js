'use strict';

(function () {

  function IOS ($window, $q) {

    var MSG = 'roles';
    var CALLBACK = 'iosRolesCallback';

    var messages = {};
    var id = 0;

    function handler (name) {
      return $window.webkit.messageHandlers[name];
    }

    $window[CALLBACK] = function(res,req) {
      var msg = messages[req.requestId];
      if (msg) {
        if (res.length) {
          msg.resolve(res[0]);
        } else {
          msg.reject('Response is not array');
        }
        delete messages[req.requestId];
      }
    };

    var me = {

      getRoles: function () {

        return $q(function (resolve, reject) {

          var msg = {
            requestId: ++id,
            callback: CALLBACK
          };

          messages[id] = {
            resolve: resolve,
            reject: reject,
            msg: msg
          };

          handler(MSG).postMessage(msg);

        });

      }

    };

    function init () {
      return me;
    }

    return {

      init: init,

      isIos: function () {
        return !!$window.webkit;
      },

      handler: handler

    };

  }

  angular.module('sistemium')
    .service('IOS', IOS);

})();
