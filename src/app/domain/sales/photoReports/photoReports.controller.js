'use strict';

(function () {

  function PhotoReportsController(Schema, Helpers, $scope, SalesmanAuth/*, $state*/) {

    const {Partner/*, PhotoReport, Outlet*/} = Schema.models();
    const {saMedia, saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use({
        takePhoto,
        outletClick,
        rowHeight
      });

    findOutlets();

    function findOutlets() {

      let filter = SalesmanAuth.makeFilter();

      return Partner.findAllWithRelations(filter, {bypassCache: true})(['Outlet'])
        .then(partners => vm.partners = partners);

    }


        });

    }

    function takePhoto() {

      console.info('takePhoto()');
      // $state.go('sales.territory');
      // return PhotoHelper.takePhoto('PhotoReport', {visitId: vm.visit.id}, vm.thumbnails);

    }

    function outletClick(outlet) {

      console.info('outletClick', outlet);
      vm.selectedOutlet = outlet;

    }

    function rowHeight(partner) {

      let xsMargin = (saMedia.xsWidth || saMedia.xxsWidth) ? 21 : 0;
      return 39 + partner.outlets.length * 29 + 8 + 17 - xsMargin;

    }

  }

  angular.module('webPage')
    .controller('PhotoReportsController', PhotoReportsController);

}());
