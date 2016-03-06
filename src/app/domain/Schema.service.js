angular.module('Models')
  .service('Schema', function ($window, DS, IosAdapter) {

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
            return aggregate(name) [type](owner[items]);
          };

        });

        return res;
      }

    };

    var schema = {

      register: function (def) {
        models [def.name] = DS.defineResource(def);
        if (def.methods) {
          models [def.name].agg = aggregator(Object.keys(def.methods), 'sumFn')
        }
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
    }

    return schema;

  });
