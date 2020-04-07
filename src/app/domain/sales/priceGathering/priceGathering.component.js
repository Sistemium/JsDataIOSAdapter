(function (module) {

  module.component('priceGathering', {

    bindings: {
      articles: '<',
      prices: '=',
    },

    templateUrl: 'app/domain/sales/priceGathering/priceGathering.html',

    controller: priceGatheringController,
    controllerAs: 'vm'

  });

  /** @ngInject */
  function priceGatheringController($uibModal, $scope) {

    _.assign(this, {

      $onInit() {
        if (!this.prices) {
          this.prices = {};
        }
      },

      openModal(article) {

        const scope = $scope.$new(true);

        this.modal = $uibModal.open({

          animation: false,
          templateUrl: 'app/domain/sales/priceGathering/priceGathering.modal.html',

          size: 'sm',
          windowClass: 'price-gathering modal-info',
          scope: _.assign(scope, {
            vm: {
              // priceView: 0,
              price: this.prices[article.id] || 0,
              article,
              closeClick: () => {
                this.modal.close();
              },
              saveClick: (price) => {
                this.modal.close();
                this.prices[article.id] = price;
              },
            }
          }),
          bindToController: false

        });

        this.modal.result
          .catch(_.noop)
          .finally(() => scope.$destroy());

      }

    });

    /*
     Functions
     */

  }

})(angular.module('Sales'));
