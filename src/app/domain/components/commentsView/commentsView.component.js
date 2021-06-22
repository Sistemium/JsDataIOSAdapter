(function () {

  const URL = 'app/domain/components/commentsView';

  angular.module('Sales')
    .component('commentsView', {

      bindings: {
        comments: '<',
      },

      templateUrl: `${URL}/commentsView.html`,
      controller() {
      },
      controllerAs: 'vm'

    });

})();
