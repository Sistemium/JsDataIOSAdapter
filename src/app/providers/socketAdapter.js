'use strict';

(function () {

  angular.module('Models').service('SocketAdapter', function (Sockets) {

    var DEBUG = debug ('stg:SocketAdapter');
    var Defaults = function () {};
    var defaultsPrototype = Defaults.prototype;
    defaultsPrototype.basePath = '';

    var SocketAdapter = function (options) {
      options || (options = {});
      this.defaults = new Defaults();
      _.assign(this.defaults, options);
    };

    function emit (options) {
      var q = Sockets.emitQ('jsData',options);
      q.then(function(data){
        DEBUG ('emit:success', options.resource, data, options);
      },function(err){
        DEBUG ('emit:catch', err, options);
      });
      return q;
    }

    //function paramsToOptions (params) {
    //
    //  var parsed = {};
    //
    //  if (params.limit) {
    //    parsed.pageSize = params.limit;
    //  }
    //
    //  if (params.offset) {
    //    parsed.startPage = Math.ceil(params.offset / (params.limit || 1)) + 1;
    //  }
    //
    //  delete params.limit;
    //  delete params.offset;
    //
    //  return parsed;
    //}

    SocketAdapter.prototype.findAll = function (resource, params, options) {
      return emit({
        method: 'findAll',
        //TODO rename models with pool or set basePath for adapter or leave as it is now
        resource: (this.defaults.pool || options.pool) + '/' + resource.name,
        params: params,
        options: angular.extend({
          headers: {
            'x-page-size': options.limit || 1000
          }
        },options)
      });
    };

    SocketAdapter.prototype.find = function (resource, id, options) {
      return emit({
        method: 'find',
        //TODO rename models with pool or set basePath for adapter or leave as it is now
        resource: (this.defaults.pool || options.pool) + '/' + resource.name,
        id: id,
        options: options
      });
    };

    SocketAdapter.prototype.create = function (resource, attrs, options) {
      return emit({
        method: 'create',
        resource: (this.defaults.pool || options.pool) + '/' + resource.name,
        attrs: attrs
      });
    };

    SocketAdapter.prototype.update = function (resource, id, attrs, options) {
      return emit({
        method: 'update',
        resource: (this.defaults.pool || options.pool) + '/' + resource.name,
        id: id,
        attrs: attrs
      });
    };

    SocketAdapter.prototype.destroy = function (resource, id, options) {
      var q = emit({
        method: 'destroy',
        resource: (this.defaults.pool || options.pool) + '/' + resource.name,
        id: id,
        options: options
      });

      q.catch (function(err){
        if (err && err.error === 404) {
          resource.eject(id);
        }
      });

      return q;
    };

    return SocketAdapter;
  });

}());
