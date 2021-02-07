(function () {

  const URL = 'app/domain/sales/campaigns/actionView';
  const { minBy, maxBy, min, filter } = _;

  angular.module('Sales')
    .component('actionView', {

      bindings: {
        action: '<',
        showPictures: '<',
      },

      templateUrl: `${URL}/actionView.html`,
      controller: actionViewController,
      controllerAs: 'vm'

    });

  /** @ngInject */
  function actionViewController() {

    _.assign(this, {

      $onInit() {
        const layout = this.action.layout || {};
        const variants = actionVariants(this.action);
        _.assign(this, {
          variants,
          layout,
          layoutStyle: layoutStyle(layout, directionStyle(layout)),
          footerCommentText: layout.commentText || this.action.commentText,
          showFooter: this.hasFoot(),
          hasDiscounts: hasDiscounts(variants),
        });
      },

      hasFoot() {
        const { action } = this;
        return action.commentText
          || _.get(action.layout, 'commentText')
          || action.needPhoto
          || action.priorityId
          || (this.showPictures && _.get(action.layout, 'pictures.length'));
      },

    });

    function directionStyle({ align }) {
      switch (align) {
        case 'center':
          return 'column-reverse';
        case 'flex-start':
          return 'row';
        default:
          return 'row-reverse';
      }
    }

    function layoutStyle(layout, directionStyle) {
      const { align = 'center' } = layout;
      return {
        'justify-content': align === 'center' ? 'center' : 'flex-end',
        'flex-direction': directionStyle,
      };
    }

    function actionVariants(action) {

      const { ranges = [], options } = action;

      return options.map((variant, idx) => {

        const rows = variantRows(variant);

        const res = _.defaults({
          num: idx + 1,
          rows,
          rowspan: rows.length + (variant.commentText ? 1 : 0),
          requiredVolume: requiredVolume(variant),
          ranges: ranges.length ? ranges : undefined,
        }, variant, {
          discountOwn: action.discountOwn || undefined,
          discountComp: action.discountComp || undefined,
          discountCash: action.discountCash || undefined,
        });

        const discountTotal = (res.discountComp || 0) + (res.discountOwn || 0);

        if (discountTotal) {
          res.discountTotal = discountTotal;
        }

        return res;

      });

    }

    function variantRows(variant) {

      const { options = [], discountOwn, discountComp, discountCash, discountMatrix } = variant;

      const res = options.length ? options : [{}];
      const discountTotalVariant = (discountComp || 0) + (discountOwn || 0);

      return res.map(row => {

        const discountTotal = (row.discountComp || 0) + (row.discountOwn || 0);

        const res = _.assign({
          discountTotal: discountTotal || discountTotalVariant || undefined,
          discountOwn,
          discountComp,
          discountCash,
          requiredVolume: requiredVolume(row, discountMatrix),
        }, row);

        if (discountMatrix) {
          res.required = { sku: matrixSkuMin({ discountMatrix }) };
          res.discountOther = discountMatrixDiscountRange(discountMatrix);
        }

        return res;

      });

    }

    function requiredVolume({ required = {} }, discountMatrix) {
      const { pcs, volume, etc, cost } = required;
      if (discountMatrix) {
        return discountMatrixMinVolumes(discountMatrix);
      }
      if (!volume && !pcs && !etc && !cost) {
        return undefined;
      }
      return required;
    }

    function hasDiscounts(variants) {
      return !!_.find(variants, 'discountTotal');
    }


    function matrixSkuMin({ discountMatrix }) {
      if (!discountMatrix) {
        return null;
      }
      const { axisY, axisX } = discountMatrix;
      const { sku: minY } = minBy(axisY, 'sku') || {};
      const { sku: minX } = minBy(axisX, 'sku') || {};
      const res = min(filter([minX, minY]));
      return res && `от ${res}`;
    }

    function discountMatrixMinVolumes(discountMatrix, field = 'pcs') {
      const { axisY, axisX } = discountMatrix;
      const { [field]: minY } = minBy(axisY, field) || {};
      const { [field]: minX } = minBy(axisX, field) || {};
      const res = min(filter([minX, minY]));
      return { [field]: res };
    }

    function discountMatrixDiscountRange(discountMatrix) {
      const { values } = discountMatrix;
      const { discountOwn: discountOwnMin } = minBy(values, 'discountOwn') || {};
      const { discountOwn: discountOwnMax } = maxBy(values, 'discountOwn') || {};
      if (!discountOwnMin && !discountOwnMax) {
        return null;
      }
      return `от ${discountOwnMin} до ${discountOwnMax}`;
    }

  }

})();
