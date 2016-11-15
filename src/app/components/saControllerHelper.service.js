'use strict';

(function () {

  function saControllerHelper() {

    return {
      setup
    };

    function use(helper, scope) {

      var me = this;

      if (!helper) return me;

      if (_.isFunction(helper.setupController)) {
        helper.setupController(helper, scope);
        return me;
      }

      return _.assign(me, helper);

    }

    function managedOn(scope, event, callback) {
      var un = scope.$on(event, callback);
      scope.$on('$destroy', un);
      return this;
    }

    function setup(vm, scope) {

      var bindAllStore = {};

      scope.$on('$destroy', () => _.each(bindAllStore, unbind => unbind()));

      return _.assign(vm,{

        use: (helper) => use.call(vm, helper, scope),
        onScope: (event, callback) => managedOn.call(vm, scope, event, callback),
        watchScope: (expr, callback) => {
          scope.$watch(expr, callback);
          return vm;
        },
        rebindAll: (model, filter, expr, callback) => {
          var unbind = bindAllStore[expr];
          if (unbind) unbind();
          bindAllStore[expr] = model.bindAll(filter, scope, expr, callback);
          return vm;
        }

      });

    }

  }

  angular.module('sistemium.services')
    .service('saControllerHelper', saControllerHelper);

})();
