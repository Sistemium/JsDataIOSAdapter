'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({

          name: 'shipping',
          abstract: true,
          templateUrl: 'app/domain/ui-view.html'

        })
      ;

      stateHelperProvider
        .state({

          url: '/shippingphotos',
          name: 'shipping.photos',
          templateUrl: 'app/domain/shipping/shippingPhotos/shippingPhotos.html',
          controller: 'ShippingPhotos as vm'

        })
      ;

    });

})();
