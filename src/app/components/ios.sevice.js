'use strict';

(function () {

  function IOS($window, $q, $timeout) {

    var CHECKIN = 'checkin';

    var CALLBACK = 'iosPhotoCallback';

    var messages = {};
    var id = 0;

    var deb = $window.debug('stg:IOS');

    function handler(name) {
      return $window.webkit.messageHandlers[name] || {
          postMessage: function(options){

            if (name === 'roles') {
              $window[options.callback] ([{
                account: {
                  name: 'Error'
                },
                roles: {
                  picker: true
                }
              }],options);
            } else {
              console.error ('IOS handler undefined call', name, options);
            }

          }
        };
    }

    function message(handlerName, cfg) {

      return $q(function (resolve, reject) {
        var requestId = ++id;

        var msg = angular.extend({
          callback: CALLBACK,
          requestId: requestId,
          options: {
            requestId: requestId
          }
        }, cfg);

        messages[requestId] = {
          resolve: resolve,
          reject: reject,
          msg: msg
        };

        handler(handlerName).postMessage(msg);

        if (cfg && cfg.timeout) {
          $timeout(function () {
            delete messages[requestId];
            reject({error: handlerName + ' request timeout'});
          }, cfg.timeout);
        }

      });

    }

    $window[CALLBACK] = function (res, req) {

      var msg = messages[req.requestId];

      if (msg) {
        if (angular.isArray(res)) {
          $timeout(function () {
            deb('resolve', req, res);
            msg.resolve(res[0]);
          });
        } else {
          $timeout(function () {
            deb('reject', req, res);
            msg.reject(res || 'Response is not array');
          });
        }
        delete messages[req.requestId];
      }

    };

    function getPicture(id, size) {
      return message('getPicture', {
        id: id,
        size: size || 'thumbnail'
      });
    }

    function takePhoto(entity, data) {
      return message('takePhoto', {
        entityName: entity,
        data: data
      });
    }

    function checkIn(accuracy, data) {

      return message(CHECKIN, {
        accuracy: accuracy,
        data: data,
        timeout: 20000
      });

    }

    var me = {

      getRoles: function () {
        return message('roles');
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
      checkIn: checkIn,
      getPicture: getPicture,
      takePhoto: takePhoto

    };

  }

  angular.module('sistemium')
    .service('IOS', IOS)
    .run(function ($window, IOS) {
      $window.saIOS = IOS;
    });

})();
