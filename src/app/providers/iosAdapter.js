'use strict';

(function () {

  angular.module('webPage')
    .service('IosAdapter', IosAdapterService);

  function IosAdapterService($window, $timeout, DSUtils, $log, IosParser, IOS) {

    let ios = IOS.isIos ? IOS : undefined;
    const requests = {};
    let counter = 1;
    const deb = $window.debug('stg:IosAdapter');


    function IosAdapter(schema) {

      function iosCallback(name, parser) {
        return function (data, req) {

          let id = req && req.options && req.options.requestId;
          let request = id && requests [id];

          if (!request) {
            return IOS.iosCallback(name, data, req);
          }

          if (name === 'resolve') {

            if (parser) {
              parser(data, request.message.entity);
            }

            if (_.get(request, 'message.options.oneObject') && angular.isArray(data)) {
              data = data.length ? data[0] : undefined;
            }
          }

          deb(name, req.entity, data);

          request[name](data);

          delete requests [id];


        }
      }

      function iosParser(data, entity) {

        IosParser.parseArray(data, schema.model(entity))

      }

      $window.iSistemiumIOSCallback = iosCallback('resolve', iosParser);

      $window.iSistemiumIOSErrorCallback = iosCallback('reject');

    }

    function jsdParamsToIOSWhere(params) {

      if (params.where) {
        return params.where;
      }
      return _.mapValues(params, function (val) {
        return {
          '==': val
        }
      });
    }

    function requestFromIOS(type, entity, params, options) {

      let id = counter;

      counter = counter + 2;

      options.requestId = id;

      let message = {

        entity: entity,
        options: options

      };

      if (angular.isString(params)) {
        message.id = params;
      } else if (type === 'update') {
        message.data = params;
      } else if (params) {
        message.where = jsdParamsToIOSWhere(params);
      }

      let promise = new DSUtils.Promise(function (resolve, reject) {

        requests [id] = {
          promise: promise,
          message: message,
          resolve: resolve,
          reject: reject
        };

        ios.handler(type).postMessage(message);

      });

      return promise;
    }

    if (!ios) {

      let mock = {
        postMessage: function (req) {
          $log.log(req);
        }
      };

      ios = {
        handler(){
          return mock;
        }
      }
    }

    const STAPI_OPTION_ORDER_BY = 'x-order-by:';
    const STAPI_OPTION_SOCKET_SOURCE = 'socketSource';

    function paramsToOptions(params) {

      let parsed = {};

      _.each(params, (val, key) => {
        if (!_.isFunction(val)) {
          parsed[key] = val;
        }
      });

      if (params.orderBy && params.orderBy.length) {

        if (!_.isArray(params.orderBy)) {
          params.orderBy = [[params.orderBy]];
        } else if (!_.isArray(params.orderBy[0])) {
          params.orderBy = [params.orderBy];
        }

        params[STAPI_OPTION_ORDER_BY] = _.map(params.orderBy, order => {
          let [col, dir = ''] = order;
          return `${dir.match(/desc/i) ? '-' : ''}${col}`;
        }).join(',');

      }

      if (params.limit) {
        parsed.pageSize = params.limit;
      }

      if (params.startPage) {
        parsed.startPage = params.startPage;
      }

      if (params.offset) {
        parsed.startPage = Math.ceil(params.offset / (params.limit || 1)) + 1;
      }

      let stApiOrder = params[STAPI_OPTION_ORDER_BY];

      if (stApiOrder) {
        let desc = _.startsWith(stApiOrder, '-');
        parsed.sortBy = _.replace(stApiOrder, '-', '');
        if (desc) {
          parsed.direction = 'DESC';
        }
        delete params[STAPI_OPTION_ORDER_BY];
      }

      if (params[STAPI_OPTION_SOCKET_SOURCE]) {
        parsed[STAPI_OPTION_SOCKET_SOURCE] = true;
      }

      delete params.limit;
      delete params.offset;
      delete params._;
      delete params.orderBy;

      return parsed;

    }

    IosAdapter.prototype.findAll = function (resource, params, options) {

      options = _.assign(paramsToOptions(options), paramsToOptions(params));

      return requestFromIOS('findAll', resource.endpoint, params, angular.extend({
          pageSize: 1000,
          startPage: 1
        }, options)
      );
    };

    IosAdapter.prototype.find = function (resource, id, options) {
      return requestFromIOS('find',
        resource.endpoint,
        angular.isObject(id) && id.id || id,
        angular.extend(options || {}, {oneObject: true})
      );
    };

    IosAdapter.prototype.create = function (resource, attrs) {
      return requestFromIOS('update', resource.endpoint, attrs, {
        oneObject: true
      });
    };

    IosAdapter.prototype.update = function (resource, id, attrs) {
      return requestFromIOS('update', resource.endpoint, attrs, {
        oneObject: true
      });
    };

    IosAdapter.prototype.destroy = function (resource, id, options) {
      return requestFromIOS('destroy', resource.endpoint, id, options || {});
    };

    //IosAdapter.prototype.updateAll = function (resource, attrs, params, options) {
    //  return requestFromIOS('updateAll', resource.endpoint, {}, {
    //    data: attrs
    //  });
    //};

    return IosAdapter;
  }

})();
