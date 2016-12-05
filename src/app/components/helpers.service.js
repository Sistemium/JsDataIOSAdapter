'use strict';

(function () {

  angular.module('webPage')
    .service('Helpers', function(
      saControllerHelper,
      saEtc,
      ConfirmModal,
      mapsHelper,
      toastr,
      PhotoHelper,
      LocationHelper,
      ClickHelper,
      saMedia
    ) {

      return {

        saControllerHelper,
        saEtc,
        ConfirmModal,
        mapsHelper,
        toastr,
        PhotoHelper,
        LocationHelper,
        ClickHelper,
        saMedia

      };

    });

})();
