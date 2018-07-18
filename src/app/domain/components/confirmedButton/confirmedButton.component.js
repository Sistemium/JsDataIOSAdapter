(function () {

  angular.module('sistemium')
    .component('confirmedButton', {

      bindings: {
        text: '@',
        confirmText: '@',
        buttonClass: '@',
        onConfirm: '&',
        noConfirm: '<',
      },

      controller($timeout) {

        _.assign(this, {

          buttonClick: () => {
            if (this.noConfirm || this.confirmation) {
              return this.onConfirm();
            }
            this.confirmation = $timeout(() => this.confirmation = false, 5000);
          },

          cancelClick: () => {
            if (this.confirmation) {
              $timeout.cancel(this.confirmation);
            }
            this.confirmation = false;
          },

        });

      },

      transclude: {
        cancel: '?cancel',
      },

      templateUrl: 'app/domain/components/confirmedButton/confirmedButton.html',
      controllerAs: 'vm',

    });

})();
