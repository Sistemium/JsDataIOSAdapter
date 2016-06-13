'use strict';

(function () {

  function IOS($window, $q, $rootScope) {

    var MSG = 'roles';
    var CHECKIN = 'checkin';
    var ROLES_CALLBACK = 'iosRolesCallback';
    var CHECKIN_CALLBACK = 'iosCheckInCallback';

    var messages = {};
    var id = 0;

    function handler(name) {
      return $window.webkit.messageHandlers[name];
    }

    $window[ROLES_CALLBACK] = function (res, req) {
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

    $window[CHECKIN_CALLBACK] = $window[ROLES_CALLBACK];

    function checkIn(accuracy) {

      return $q(function (resolve, reject) {

        var msg = {
          callback: CHECKIN_CALLBACK,
          accuracy: accuracy,
          options: {
            requestId: ++id
          }
        };

        msg.requestId = id;

        messages[id] = {
          resolve: resolve,
          reject: reject,
          msg: msg
        };

        handler(CHECKIN).postMessage(msg);

      });

    }

    var me = {

      getRoles: function () {

        return $q(function (resolve, reject) {

          var msg = {
            requestId: ++id,
            callback: ROLES_CALLBACK
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

    function init() {
      return me;
    }

    return {

      init: init,

      isIos: function () {
        return !!$window.webkit;
      },

      handler: handler,
      checkIn: checkIn

    };

  }

  angular.module('sistemium')
    .service('IOS', IOS);

})();
