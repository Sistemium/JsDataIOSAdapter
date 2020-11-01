(function () {

  const URL = 'app/domain/sales/campaigns/actionView';

  angular.module('Sales')
    .component('actionView', {

      bindings: {
        action: '<',
      },

      templateUrl: `${URL}/actionView.html`,
      controller: actionViewController,
      controllerAs: 'vm'

    });

  /** @ngInject */
  function actionViewController() {

    _.assign(this, {

      $onInit() {
        this.variants = variants(this.action);
        console.log(this.variants);
      },

      hasFoot() {
        return !!this.action.commentText;
      },

    });

    function variants(action) {

      const { ranges = [], options } = action;

      return options.map((variant, idx) => {

        const rows = variantRows(variant);

        return _.defaults({
          num: idx + 1,
          rows,
          requiredVolume: requiredVolume(variant),
          ranges: ranges.length ? ranges : undefined,
        }, variant);

      });

    }

    function variantRows(variant) {
      const { options = [], discountOwn, discountComp } = variant;
      const res = options.length ? options : [{}];
      return res.map(row => _.assign({
        discountOwn,
        discountComp,
        requiredVolume: requiredVolume(row),
      }, row));
    }

    function requiredVolume({ required = {} }) {
      const { pcs, volume, etc, cost } = required;
      if (!volume && !pcs && !etc && !cost) {
        return undefined;
      }
      return  required;
    }

  }

})();
