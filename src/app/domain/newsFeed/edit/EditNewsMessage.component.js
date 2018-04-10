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


  function EditNewsMessageController($state, Schema, saControllerHelper, $scope, saApp, Auth, $timeout) {

    const {NewsMessage} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      isAdmin: Auth.isAuthorized('admin'),
      appVersionRe: /^\d{1,2}\.\d{1,2}\.\d{1,2}$/,

      $onInit,
      cancelClick,
      saveClick,
      hasChanges,
      isValid,
      deleteClick

    });

    /*
    Functions
     */

    function deleteClick() {

      if (vm.deleting) {
        return onConfirm();
      }

      vm.deleting = $timeout(2000).then(onTimeout);

      function onConfirm() {

        if (!vm.newsMessage.id) {
          $state.go('^');
        }

        return vm.newsMessage.DSDestroy()
          .then(() => $state.go('^'));

      }

      function onTimeout() {
        delete vm.deleting;
      }

    }

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
          appVersion: saApp.version(),
          authId: Auth.getAccount().authId
        });
      }

    }

    function saveClick() {

      if (!hasChanges()) {
        return goShow();
      }

      NewsMessage.create(vm.newsMessage)
        .then(goShow);
    }

    function goShow(newsMessage = vm.newsMessage) {
      $state.go('^.show', {newsMessageId: newsMessage.id});
    }

  }

})();
