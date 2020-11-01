(function () {

  const URL = 'app/domain/sales/campaigns/actionRequiredVolume';
  const { filter } = _;

  angular.module('Sales')
    .component('actionRequiredVolume', {

      bindings: {
        required: '<',
      },

      templateUrl: `${URL}/actionRequiredVolume.html`,
      controller: actionRequiredVolumeController,
      controllerAs: 'vm'

    });

  /** @ngInject */
  function actionRequiredVolumeController() {

    _.assign(this, {

      $onInit() {
        this.volume = volumeRequirements(this.required || {}) || '-';
      },

    });

    function volumeRequirements(required) {

      const { pcs, volume, volumeTo } = required;
      const { cost, costTo, isMultiple } = required;

      const res = filter([
        pcs && filter([
          !isMultiple && 'от',
          `${pcs} бут.`,
        ])
          .join(' '),
        volume && filter([
          !isMultiple && 'от',
          `${volume} л.`,
          volumeTo && `до ${volumeTo}`,
        ])
          .join(' '),
        cost && filter([
          !isMultiple && 'от',
          `${cost}&nbsp;руб.`,
          costTo && `до ${costTo}`,
        ])
          .join(' '),
      ])
        .join('\n+');

      if (!res) {
        return undefined;
      }

      return filter([
        `<span>${res}</span>`,
        isMultiple && '<small>(кратно)</small>',
        required.etc && `<em>${required.etc}</em>`,
      ])
        .join('');

    }

  }

})();
