'use strict';

(function () {

  angular.module('webPage')
    .component('editNewsMessage', {

      bindings: {
        newsMessage: '=?'
      },

      templateUrl: 'app/domain/newsFeed/edit/editNewsMessage.html',

      controller: EditNewsMessageController,
      controllerAs: 'vm'

    });


  function EditNewsMessageController($state, Schema, saControllerHelper, $scope, saApp) {

    const {NewsMessage} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      appVersionRe: /^\d{1,2}\.\d{1,2}\.\d{1,2}$/,

      $onInit,
      cancelClick,
      saveClick,
      hasChanges,
      isValid

    });

    /*
    Functions
     */

    function isValid() {
      return vm.newsMessage && vm.newsMessage.subject && vm.newsMessage.body;
    }

    function hasChanges() {
      let id = _.get(vm, 'newsMessage.id');
      return vm.newsMessage && (!id || NewsMessage.hasChanges(id));
    }

    function cancelClick() {
      let {id} = vm.newsMessage;
      id && NewsMessage.revert(id);
      // _.result(vm, 'newsFeedForm.$setPristine');
      $state.go('^');
    }

    function $onInit() {

      if (vm.newsMessage) return;

      if ($state.params.newsMessageId) {
        vm.rebindOne(NewsMessage, $state.params.newsMessageId, 'vm.newsMessage');
      } else {
        vm.newsMessage = NewsMessage.createInstance({
          appVersion: saApp.version()
        });
      }

    }

    function saveClick() {

      if (!hasChanges()) {
        return $state.go('^');
      }

      NewsMessage.create(vm.newsMessage)
        .then(data => {
          vm.newsMessage = data;
          $state.go('^');
        });
    }

  }

})();
