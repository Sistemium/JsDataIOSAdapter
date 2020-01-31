(function () {

  angular.module('Sales')
    .service('PhotoReporting', PhotoReporting);

  function PhotoReporting($uibModal, Schema) {

    const { Campaign, PhotoReport } = Schema.models();

    return {

      showEdit(photoReport, campaignGroup) {

        const photoReportOrigin = _.assign({}, photoReport);

        const modal = $uibModal.open({

          animation: false,
          templateUrl: 'app/domain/sales/photoReports/edit/photoReportModal.html',

          size: 'lg',
          controllerAs: 'vm',

          windowClass: 'photo-report-modal modal-info',

          controller() {
            this.photoReport = PhotoReport.createInstance(photoReportOrigin);
            this.campaignGroup = campaignGroup;
            this.closeClick = () => modal.close();
            this.saveClick = () => {
              this.photoReport.DSCreate()
                .then(() => modal.close());
            };
            this.hasChanges = () => !_.isMatch(photoReportOrigin, this.photoReport);
          },

        });

        modal.result
          .then(_.noop, _.noop);

      },

      campaignsByGroup(campaignGroup) {
        return Campaign.findAll(Campaign.meta.filterByGroup(campaignGroup))
          .then(campaigns => {
            return _.filter(campaigns, ({ source }) => source !== 'new');
          });
      },

    };
  }

})();
