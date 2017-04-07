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
        helper.setupController(me, scope);
        return me;
      }

      return _.assign(me, helper);

    }

    function managedOn(scope, event, callback) {
      var un = scope.$on(event, callback);
      scope.$on('$destroy', un);
      return this;
    }

    function watchStateChange(vm, $scope) {
      managedOn($scope, '$stateChangeSuccess', (event, toState, toParams) => {

        _.assign(vm, {
          currentState: _.first(toState.name.match(/[^.]+$/))
        });

        if (_.isFunction(vm.onStateChange)) {
          vm.onStateChange(toState, toParams);
        }

      })
    }

    function setup(vm, scope) {

      var bindAllStore = {};
      var busyArray = [];

      scope.$on('$destroy', () => _.each(bindAllStore, unbind => unbind()));
      watchStateChange(vm, scope);

      return _.assign(vm,{

        use: (helper) => use.call(vm, helper, scope),
        onScope: (event, callback) => {
          managedOn.call(vm, scope, event, callback);
          return vm;
        },
        watchScope: (expr, callback, byProperties) => {
          scope.$watch(expr, callback, byProperties);
          return vm;
        },

        rebindAll: (model, filter, expr, callback) => {
          var unbind = bindAllStore[expr];
          if (unbind) unbind();
          bindAllStore[expr] = model.bindAll(filter, scope, expr, callback);
          return vm;
        },

        rebindOne: (model, id, expr, callback) => {
          var unbind = bindAllStore[expr];
          if (unbind) unbind();
          if (id) {
            bindAllStore[expr] = model.bindOne(id, scope, expr, callback)
          } else {
            _.set(scope, expr, null);
          }
          return vm;
        },

        setBusy: (promise, message) => {

          if (_.isArray(promise)) {
            promise = $q.all(promise);
          }

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
              vm.busy = false;
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

          return promise;

        }

      });

    }

  }

  angular.module('sistemium.services')
    .service('saControllerHelper', saControllerHelper);

})();
