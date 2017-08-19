'use strict';

(function () {

  angular.module('webPage')
    .service('Helpers', function(
      saControllerHelper,
      saEtc,
      ConfirmModal,
      toastr,
      PhotoHelper,
      LocationHelper,
      ScrollHelper,
      ClickHelper,
      saMedia,
      moment,
      DomainOption
    ) {

      return {

        saControllerHelper,
        saEtc,
        ConfirmModal,
        toastr,
        PhotoHelper,
        LocationHelper,
        ScrollHelper,
        ClickHelper,
        saMedia,
        moment,
        DomainOption

      };

    });

})();
