'use strict';

(function () {

  angular.module('webPage').service('IosAdapter', function ($window, $timeout, DSUtils, $log) {

    var ios = $window.webkit;
    var requests = {};
    var counter = 1;

    var IosAdapter = function (schema) {

      function iosCallback (name, parser) {
        return function (data, req) {

          var id = req && req.options && req.options.requestId;
          var request = id && requests [id];

          if (request) {

            if (parser) {
              parser (data, request.message.entity);
            }

            request [name] (data);
            delete requests [id];
          }

        }
      }

      function iosParser (data, entity) {

        var model = schema.model (entity);
        var fieldTypes = model && model.fieldTypes;


        _.each (data, function (row) {

          _.each (fieldTypes, function (type,field){

            row [field] = (function (v) {
              switch (type) {
                case 'int':
                  return parseInt (v) || 0;
                case 'decimal':
                  return parseFloat (v) || 0;
              }
            }) (row[field]);

          });

        });

      }

      $window.iSistemiumIOSCallback = iosCallback ('resolve', iosParser);
      $window.iSistemiumIOSErrorCallback = iosCallback ('reject');

    };


    function requestFromIOS(type, entity, params, options) {

      var id = counter++;

      options.requestId = id;

      var message = {

        entity: entity,
        options: options

      };

      if (angular.isString (params)) {
        message.id = params;
      } else if (params) {
        message.where = _.mapValues (params,function (val) {
          return {
            '==': val
          }
        });
      }

      var promise = new DSUtils.Promise(function (resolve, reject) {

        requests [id] = {

          promise: promise,
          message: message,
          resolve: resolve,
          reject: reject

        };

        ios.messageHandlers[type].postMessage (message);

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
          pageSize: 300,
          startPage: 1
        }, options || {})
      );
    };

    IosAdapter.prototype.find = function (resource, id, options) {
      return requestFromIOS('find', resource.endpoint, angular.isObject (id) && id.id || id, options || {});
    };

    IosAdapter.prototype.create = function (resource, attrs) {
      return requestFromIOS('create', resource.endpoint, {
        data: attrs
      });
    };

    return IosAdapter;
  });

}());
