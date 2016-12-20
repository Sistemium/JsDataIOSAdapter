'use strict';

(function () {

  let basePath = window.localStorage.getItem('JSData.BasePath')
      || location.protocol === 'https:' && '/api/dev/'
      || 'https://api.sistemium.com/v4d/dev/'
    ;

  angular.module('Models', ['sistemium'])
    .config(ModelsConfig)
    .service('Schema', Schema)
    .service('models', Models)
    .run(registerAdapters);

  function ModelsConfig(DSHttpAdapterProvider) {
    angular.extend(DSHttpAdapterProvider.defaults, {
      basePath: basePath
    });
  }

  function Models(Schema) {
    return Schema.models();
  }

  function Schema(saSchema, $http, $window, DEBUG, $q, DS, DSUtils) {

    function loadPaged(resource, filter, opts) {

      let options = _.defaults({
        startPage: opts.startPage || 1,
        bypassCache: true
      }, opts);
      let pageSize = options.limit = options.limit || 1500;

      return resource.findAll(filter, options)
        .then(res => {

          DEBUG('Got', res.length, 'of', resource.name, 'at page', options.startPage);

          if (res.length >= pageSize) {
            if (options.startPage > 20) {
              return $q.reject(`Page limit reached on querying "${resource.name}"`);
            }
            return loadPaged(
              resource,
              filter,
              _.assign(options, {startPage: options.startPage + 1})
            ).then(res2 => {
              Array.prototype.push.apply(res, res2);
              return res;
            });
          }

          return res;

        });

    }

    function getCount(resource, params) {

      let url = `${basePath}/${resource.endpoint}`;
      let qs = {params: _.assign({'agg:': 'count'}, params || {})};

      return $http.get(url, qs)
        .then(res => parseInt(res.headers('x-aggregate-count')));

    }

    function cachedFindAll(resource, filter, options) {

      let store = DS.store[resource.name];
      let queryHash = DSUtils.toJson(filter);
      let completed = store.queryData[queryHash];

      if (completed) return $q.resolve(resource.filter(filter));

      return resource.findAll(filter, _.defaults({cacheResponse: false}, options))
        .then(res => {

          // TODO: check if it's all correct

          _.each(res, item => {
            let existing = store.index[item.id];
            if (existing) {
              DSUtils.forOwn(item, (val, key) => existing[key] = val);
            } else {
              store.index[item.id] = item;
              store.collection.push(item);
            }
          });

          store.queryData[queryHash] = {$$injected: true};

          return store.collection;

        });
    }

    function unCachedSave(definition, _id, options) {

      let resource = DS.store[definition.name];

      let id = _.get(_id, 'id') || _id;

      function shouldKeep(key) {
        return (options.keepChanges||[]).indexOf(key) >= 0;
      }

      return definition.save(id, _.assign({cacheResponse: false}, options))
        .then(serverItem => {

          let localItem = resource.index[id];

          DSUtils.forOwn(serverItem, (val, key) => shouldKeep(key) || (localItem[key] = val));

          resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
          resource.previousAttributes[id] = DSUtils.copy(serverItem, null, null, null, definition.relationFields);

        })
    }

    return $window.saSchema = saSchema({

      getCount,

      loadPaged: function (filter, options) {
        return loadPaged(this, filter, options)
      },

      cachedFindAll: function (filter, options) {
        return cachedFindAll(this, filter, options)
      },

      unCachedSave: function (filter, options) {
        return unCachedSave(this, filter, options)
      }

    });

  }

  function registerAdapters($window, DS, IosAdapter, SocketAdapter, Schema, InitService) {

    if ($window.webkit) {
      DS.registerAdapter('ios', new IosAdapter(Schema), {default: true});
    } else {
      InitService.then(app => {
        DS.registerAdapter('socket', new SocketAdapter({pool: app.org}), {default: true});
      });
    }

    _.assign(DS.defaults, {
      watchChanges: false,
      instanceEvents: false
    });

    $window.saDS = DS;

  }

}());
