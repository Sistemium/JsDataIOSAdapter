(function () {

  angular.module('sistemium')
    .component('confirmedButton', {

      bindings: {
        text: '@',
        confirmText: '@',
        buttonClass: '@',
        onConfirm: '&',
        confirm: '<',
      },

      controller($timeout) {

        _.assign(this, {

          buttonClick: () => {
            if (!this.confirm || this.confirmation) {
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

      transclude: true,
      templateUrl: 'app/domain/components/confirmedButton/confirmedButton.html',
      controllerAs: 'vm',

    });

})();
