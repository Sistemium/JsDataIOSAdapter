(function () {
  'use strict';

  angular
    .module('webPage')
    .controller('MainController', MainController);

  /** @ngInject */

  function MainController(Menu, DomainOption) {

    _.assign(this,{
      data: Menu.root(),
      showCarousel: DomainOption.showNewsCarousel()
    });

  }

})();
