'use strict';

(function () {

  function IOS($window, $q, $timeout) {

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
          $timeout(function(){
            msg.resolve(res[0]);
          });
        } else {
          $timeout(function() {
            msg.reject('Response is not array');
          });
        }
        delete messages[req.requestId];
      }
    };

    $window[CHECKIN_CALLBACK] = $window[ROLES_CALLBACK];

    function checkIn(accuracy, data) {

      return $q(function (resolve, reject) {

        var requestId = ++id;

        var msg = {
          callback: CHECKIN_CALLBACK,
          requestId: requestId,
          options: {
            requestId: requestId
          },
          accuracy: accuracy,
          data: data
        };

        messages[requestId] = {
          resolve: resolve,
          reject: reject,
          msg: msg
        };

        handler(CHECKIN).postMessage(msg);

        $timeout(function(){
          delete messages[requestId];
          reject({ error: 'Location request timeout' });
        },20000);

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
