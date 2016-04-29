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

    function emit (data) {
      var q = Sockets.emitQ('jsData',data);
      q.then(function(){
        DEBUG ('emit:success', data);
      },function(){
        DEBUG ('emit:catch', data);
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
        resource: 'dev/' + resource.name,
        params: params,
        options: angular.extend({
          headers: {
            'x-page-size': 1000
          }
        },options)
      });
    };

    SocketAdapter.prototype.find = function (resource, id, options) {
      return emit({
        method: 'find',
        //TODO rename models with pool or set basePath for adapter or leave as it is now
        resource: 'dev/' + resource.name,
        id: id,
        options: options
      });
    };

    SocketAdapter.prototype.create = function (resource, attrs) {
      return emit({
        method: 'create',
        resource: 'dev/' + resource.name,
        attrs: attrs
      });
    };

    SocketAdapter.prototype.update = function (resource, id, attrs) {
      return emit({
        method: 'update',
        resource: 'dev/' + resource.name,
        id: id,
        attrs: attrs
      });
    };

    SocketAdapter.prototype.destroy = function (resource, id, options) {
      var q = emit({
        method: 'destroy',
        resource: 'dev/' + resource.name,
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
