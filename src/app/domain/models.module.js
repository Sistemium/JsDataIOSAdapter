'use strict';

(function () {

  angular.module('Models', ['js-data'])

    .config(function (DSProvider, DSHttpAdapterProvider) {

      var basePath = window.localStorage.getItem('JSData.BasePath')
        || 'https://api.sistemium.com/v4d/dev/';

      angular.extend(DSHttpAdapterProvider.defaults, {

        basePath: basePath,

        httpConfig: {
          headers: {
            'X-Return-Post': 'true',
            'authorization': window.localStorage.getItem('authorization')
          }
        },

        queryTransform: function queryTransform(resourceConfig, params) {

          var res = {};

          if (params.offset) {
            res['x-start-page:'] = Math.ceil(params.offset / params.limit);
          }
          if (params.limit) {
            res['x-page-size:'] = params.limit;
          }

          delete params.limit;
          delete params.offset;

          return angular.extend(res, params);

        }

      });

    })

    .service('models', function (Schema) {

      return Schema.models();

    })

    .service('Schema', function ($window, DS, IosAdapter) {

      var models = {};

      if ($window.webkit) {
        DS.registerAdapter('ios', new IosAdapter(), {default: true});
      }

      var aggregate = function (field) {

        return {

          sumFn: function (items) {
            return _.reduce(items, function (sum, item) {
              return sum + item [field]();
            }, 0);
          },

          sum: function (items) {
            return _.reduce(items, function (sum, item) {
              return sum + item [field];
            }, 0);
          }

        };

      };

      var aggregator = function (names, type) {

        return function (owner, items) {

          var res = {};

          _.each(names, function (name) {

            res [name] = function () {
              return aggregate (name) [type] (owner[items]);
            };

          });

          return res;
        }

      };

      return {

        register: function (def) {
          models [def.name] = DS.defineResource(def);
          if (def.methods) {
            models [def.name].agg = aggregator(Object.keys(def.methods), 'sumFn')
          }
        },

        models: function () {
          return models;
        },

        aggregate: aggregate

      }

    });

}());
