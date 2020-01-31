(function () {

  angular.module('Sales')
    .component('editPhotoReport', {

      bindings: {
        photoReport: '<',
        campaignGroup: '<',
      },

      templateUrl: 'app/domain/sales/photoReports/edit/editPhotoReport.html',

      controller($scope, PhotoReporting) {

        _.assign(this, {

          $onInit() {

            PhotoReporting.campaignsByGroup(this.campaignGroup)
              .then(campaigns => {
                this.campaigns = campaigns;
              });

            // _.assign(this, {
            //   campaignId: this.photoReport.campaignId,
            // });

          }

        });

      },

      controllerAs: 'vm',

    });

})();
