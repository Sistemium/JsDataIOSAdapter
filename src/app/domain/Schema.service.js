angular.module('Models')
  .service('Schema', function ($window, DS, IosAdapter, SocketAdapter) {

    var models = {};

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
            return aggregate(name) [type] (owner[items]);
          };

        });

        return res;
      }

    };

    var schema = {

      register: function (def) {

        var resource = (models [def.name] = DS.defineResource(def));

        if (def.methods) {
          resource.agg = aggregator (Object.keys(def.methods), 'sumFn')
        }

        return resource;
      },

      models: function () {
        return models;
      },

      model: function (name) {
        return models [name]
      },

      aggregate: aggregate

    };

    if ($window.webkit) {
      DS.registerAdapter('ios', new IosAdapter (schema), {default: true});
    } else {
      DS.registerAdapter('socket', new SocketAdapter(), {default: true});
    }

    return schema;

  });
