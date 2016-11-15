'use strict';

(function () {

  function saControllerHelper($q) {

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
      var busyArray = [];

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
        },

        setBusy: (promise, message) => {

          if (!busyArray.length) {

            // console.info('setBusy make new');
            vm.busy = $q((resolve, reject) => {

              function popResolver () {

                var next = busyArray.pop();

                if (next) {
                  // console.info('setBusy next', next);
                  next.promise.then(popResolver, reject);
                  if (next.message) vm.cgBusy.message = next.message;
                } else {
                  // console.info('setBusy resolve');
                  resolve();
                  vm.busy = false;
                }

              }

              promise.then(popResolver, reject)

            });

            vm.busy.catch(() => {
              busyArray = [];
            });

            vm.cgBusy = {
              promise: vm.busy
            };

            if (message) {
              vm.cgBusy.message = message;
            }

          }

          busyArray.push({promise, message});
          // console.info('setBusy push', promise);

          return vm.busy;

        }

      });

    }

  }

  angular.module('sistemium.services')
    .service('saControllerHelper', saControllerHelper);

})();
