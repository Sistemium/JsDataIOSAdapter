'use strict';

(function () {

  angular.module('webPage').service('IosAdapter', function ($window, DSUtils, $log) {

    var ios = $window.webkit;

    var IosAdapter = function () {
    };
    var requests = {};
    var counter = 1;

    function iosCallback(data, req) {

      var id = req && req.options && req.options.requestId;
      var request = id && requests [id];

      if (request) {
        request.resolve(data);
        delete requests [id];
      }

    }

    $window.iSistemiumIOSCallback = iosCallback;

    function requestFromIOS(type, entity, options) {

      var id = counter ++;

      options.requestId = id;

      var promise = new DSUtils.Promise(function (resolve, reject) {

        requests[id] = {
          promise: promise,
          resolve: resolve,
          reject: reject
        };

        ios.messageHandlers[type].postMessage({
          entity: entity,
          options: options
        });

      });

      return promise;
    }

    if (!ios) {
      ios = {
        messageHandlers: {
          findAll: {
            postMessage: function (req) {
              $log.log(req);
            }
          }
        }
      }
    }

    IosAdapter.prototype.findAll = function (resource, options) {
      return requestFromIOS('findAll', resource.name, angular.extend({
        pageSize: 10,
        startPage: 1
      }, options || {}));
    };

    IosAdapter.prototype.find = function (resource, id, options) {
      return requestFromIOS('find', resource.name, angular.extend(options, {id: id}));
    };

    IosAdapter.prototype.create = function (resource, attrs) {
      return requestFromIOS('create', resource.name, {
        data: attrs
      });
    };

    return IosAdapter;
  });

}());
