'use strict';

(function () {

    const quantityEditPopover = {

      bindings: {
        article: '<',
        saleOrder: '<',
        price: '<',
        popoverOpen: '=',
        position: '<',
        stock: '<',
        campaignVariant: '<',
      },

      templateUrl: 'app/domain/components/quantityEdit/quantityEditPopover.html',

      controller: quantityEditController,
      controllerAs: 'vm'

    };

    /** @ngInject */
    function quantityEditController($scope, IOS, Schema, DomainOption, saEtc) {

      const {SaleOrderPosition} = Schema.models();

      let vm = this;

      let saleOrder = vm.saleOrder || _.get(vm.position, 'saleOrder');
      let article = vm.article || _.get(vm.position, 'article');
      let position = vm.position ||
        _.find(_.get(saleOrder, 'positions'), {articleId: article.id});

      _.assign(vm, {

        showBottles: article.packageRel > 1,
        type: IOS.isIos() ? 'number' : 'text',
        bottleLabel: _.upperCase(article.pcsLabel),
        noFactor: !DomainOption.hasArticleFactors()
          || _.get(vm.saleOrder, 'outlet.partner.allowAnyVolume'),

        incrementBoxes: () => changeVolume(article.packageRel),
        incrementBottles: () => changeVolume(1),
        decrementBoxes: () => changeVolume(-article.packageRel),
        decrementBottles: () => changeVolume(-1),
        deleteClick,
        incrementHalfBoxes: () => changeVolume(Math.ceil(article.packageRel / 2)),

        articleFactor,

        // $onInit,
        $onDestroy,

      });

      /*
       Init
       */

      if (!position) {
        createPosition();
      }

      setQty();

      /*
       Listeners
       */

      $scope.$watch('vm.volume', saEtc.debounce(onVolumeChange, 750, $scope));
      $scope.$watch('vm.position.id', onPositionChange);

      /*
       Functions
       */

      function $onDestroy() {

      }

      function createPosition() {

        let {stock} = vm;

        let priceOrigin = stock.priceOrigin();

        if (!priceOrigin) {
          return;
        }

        const { id: campaignVariantId } = vm.campaignVariant || {};

        position = SaleOrderPosition.createInstance({
          saleOrderId: saleOrder.id,
          articleId: article.id,
          campaignVariantId: stock.campaignVariantId || campaignVariantId,
          price: stock.discountPrice(),
          priceDoc: stock.discountPriceDoc(),
          priceOrigin: priceOrigin,
          priceAgent: stock.priceAgent,
          volume: 0
        });

      }

      function onPositionChange(newPositionId, oldPositionId) {
        if (!newPositionId && oldPositionId) {
          createPosition();
        }
      }

      function deleteClick() {

        changeVolume(-position.volume);
        position.updateCost();
        saleOrder.updateTotalCost();

        if (vm.popoverOpen) vm.popoverOpen = false;

      }

      function onVolumeChange() {

        let {volume} = vm;

        if (!position) {
          // console.error('no position');
          return;
        }

        if (volume === position.volume) {
          return;
        }

        let factor = articleFactor();
        let notFactored = volume % factor;

        if (notFactored) {
          vm.invalidFactor = true;
          return;
        }

        vm.invalidFactor = false;

        position.volume = _.max([0, volume]);

        injectPosition();

      }

      function articleFactor() {
        return !vm.noFactor && _.get(vm, 'article.factor') || 1;
      }

      function changeVolume(addVolume) {

        vm.volume = _.max([(vm.volume || 0) + addVolume, 0]);

      }

      function setQty() {
        vm.volume = position.volume;
      }

      function injectPosition() {

        if (!position) {

          // console.error('no position');

          return;
        }

        setQty();

        position.updateCost();

        if (!position.id) {
          SaleOrderPosition.inject(position);
        }

        saleOrder.updateTotalCost();

      }

    }

    angular.module('sistemium')
      .component('quantityEditPopover', quantityEditPopover);

  }

)();
