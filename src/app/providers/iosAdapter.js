'use strict';

(function () {

  angular.module('webPage').service('iosAdapter', function ($window, DSUtils) {

    if (!$window.webkit) {
      //todo mock somehow
    }

    function IosAdapter() {}
    var queue = [];
    var taskInProcess = false;

    function queueTask (task) {
      if (!queue.length) {
        enqueue(task);
        dequeue();
      } else {
        enqueue(task);
      }
    }

    function enqueue (task) {
      queue.push(task);
    }

    function dequeue () {
      if (queue.length && !taskInProcess) {
        taskInProcess = true;
        queue[0]();
      }
    }

    IosAdapter.prototype.findAll = function (entity, options) {
      // Must return a promise that resolves with the found items
      return new DSUtils.Promise(function (resolve) {

        $window.webkit.messageHandlers.findAll.postMessage({
          entity: entity,
          options: options
        });

        resolve();
      });
    };

    IosAdapter.prototype.find = function (entity, id, options) {
      return new DSUtils.Promise(function (resolve) {

        $window.webkit.messageHandlers.find.postMessage({
          entity: entity,
          id: id,
          options: options
        });

        resolve();
      });
    };

    var id = 1;

    IosAdapter.prototype.create = function (definition, attrs) {
      return new DSUtils.Promise(function (resolve) {
        attrs.id = id++;
        resolve(attrs);
      });
    };

    return IosAdapter;
  });

}());
