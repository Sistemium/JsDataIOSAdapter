(function () {

  const URL = 'app/domain/sales/campaigns/actionMatrix';
  const { find } = _;

  angular.module('webPage')
    .component('actionMatrix', {

      bindings: {
        discountMatrix: '<',
      },

      templateUrl: `${URL}/actionMatrix.html`,
      controller: actionMatrixController,
      controllerAs: 'vm'

    });

  /** @ngInject */
  function actionMatrixController() {
    _.assign(this, {

      $onInit() {

        const { axisX = [], axisY = [] } = this.discountMatrix;
        const values = this.values();

        this.columns = this.axisInfo(axisX);
        this.rows = _.map(this.axisInfo(axisY), (point, colIdx) => _.assign(point, {
          values: values.map(column => column[colIdx]),
        }));

      },

      values() {
        const { values, axisX, axisY } = this.discountMatrix;
        return axisX.map(x => axisY.map(y => {
          const value = find(values, {
            x: x.id,
            y: y.id,
          });
          return value && value.discountOwn;
        }));
      },

      matrixStyle() {
        const { axisX } = this.discountMatrix;
        const auto = axis => axis.map(() => 'auto')
          .join(' ');
        return {
          'grid-template-columns': auto(['header', ...axisX]),
          // 'grid-template-rows': auto(axisX),
        };
      },

      axisInfo(axis) {
        return axis.map((point, idx) => {

          return _.defaults(
            {
              showFrom: true,
              pscTo: upToParam('pcs'),
              skuTo: upToParam('sku'),
            }, point);

          function upToParam(param) {
            const value = axis[idx][param];
            if (!value) {
              return value;
            }
            const next = axis[idx + 1];
            if (!next) {
              return undefined;
            }
            const res = next[param];
            return res && res - 1;
          }

        });
      },

    });
  }

})();
