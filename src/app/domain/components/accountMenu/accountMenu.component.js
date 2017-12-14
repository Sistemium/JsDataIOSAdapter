(function () {

  angular.module('webPage').component('accountMenu', {

    bindings:{},

    templateUrl: 'app/domain/components/accountMenu/accountMenu.html',
    controllerAs: 'vm',
    controller: accountMenuController

  });

  function accountMenuController(Auth, IOS) {

    let account = Auth.getAccount();

    _.assign(this, {

      account,
      show: !IOS.isIos() && account,

      logoutClick,

    });


    function logoutClick() {
      Auth.logout();
    }

  }

})();
