(function () {

  const URL = 'app/domain/sales/campaigns/actionView';

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
        _.assign(this, {
          variants: variants(this.action),
          layout,
          layoutStyle: layoutStyle(layout, directionStyle(layout)),
        });
      },

      hasFoot() {
        const { action } = this;
        return action.commentText
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
          return 'row-reverse';
        default:
          return 'row';
      }
    }

    function layoutStyle(layout, directionStyle) {
      const { align = 'center' } = layout;
      return {
        'justify-content': align === 'center' ? 'center' : 'flex-end',
        'flex-direction': directionStyle,
      };
    }

    function variants(action) {

      const { ranges = [], options } = action;

      return options.map((variant, idx) => {

        const rows = variantRows(variant);

        const res = _.defaults({
          num: idx + 1,
          rows,
          requiredVolume: requiredVolume(variant),
          ranges: ranges.length ? ranges : undefined,
        }, variant, {
          discountOwn: action.discountOwn || undefined,
          discountComp: action.discountComp || undefined,
        });

        const discountTotal = (res.discountComp || 0) + (res.discountOwn || 0);

        if (discountTotal) {
          res.discountTotal = discountTotal;
        }

        return res;

      });

    }

    function variantRows(variant) {

      const { options = [], discountOwn, discountComp } = variant;
      const res = options.length ? options : [{}];
      const discountTotalVariant = (discountComp || 0) + (discountOwn || 0);

      return res.map(row => {

        const discountTotal = (row.discountComp || 0) + (row.discountOwn || 0);

        return _.assign({
          discountTotal: discountTotal || discountTotalVariant || undefined,
          discountOwn,
          discountComp,
          requiredVolume: requiredVolume(row),
        }, row);

      });

    }

    function requiredVolume({ required = {} }) {
      const { pcs, volume, etc, cost } = required;
      if (!volume && !pcs && !etc && !cost) {
        return undefined;
      }
      return required;
    }

  }

})();
