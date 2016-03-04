'use strict';

(function () {

  angular.module('webPage').service('IosAdapter', function ($window, $timeout, DSUtils, $log) {

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

    function iosErrorCallback(err, req) {

      var id = req && req.options && req.options.requestId;
      var request = id && requests [id];

      if (request) {
        request.reject(err);
        delete requests [id];
      }

    }

    $window.iSistemiumIOSCallback = iosCallback;
    $window.iSistemiumIOSErrorCallback = iosErrorCallback;

    function requestFromIOS(type, entity, params, options) {

      var id = counter++;

      options.requestId = id;

      var promise = new DSUtils.Promise(function (resolve, reject) {

        requests[id] = {
          promise: promise,
          resolve: resolve,
          reject: reject
        };

        ios.messageHandlers[type].postMessage(angular.extend({
          entity: entity,
          options: options
        },params));

      });

      return promise;
    }

    if (!ios) {

      var mock = {
        postMessage: function (req) {
          $log.log(req);
        }
      };

      ios = {
        messageHandlers: {
          findAll: mock,
          find: mock
        }
      }
    }

    IosAdapter.prototype.findAll = function (resource, params, options) {
      return requestFromIOS('findAll', resource.endpoint, params, angular.extend({
          pageSize: 10,
          startPage: 1
        }, options || {})
      );
    };

    IosAdapter.prototype.find = function (resource, id, options) {
      return requestFromIOS('find', resource.endpoint, {id: id}, options || {});
    };

    IosAdapter.prototype.create = function (resource, attrs) {
      return requestFromIOS('create', resource.endpoint, {
        data: attrs
      });
    };

    return IosAdapter;
  });

}());
