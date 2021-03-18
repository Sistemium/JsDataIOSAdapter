(function () {

  angular.module('Models').run(function (Schema) {

    const LEVEL_CHOICES = {};

    Schema.register({

      name: 'OutletStats',

      relations: {
        belongsTo: {
          Outlet: {
            localField: 'outlet',
            localKey: 'outletId',
          },
          Salesman: {
            localField: 'salesman',
            localKey: 'salesmanId',
          },
        },
      },

      meta: {},

      methods: {

        getNextPSLevel() {
          return LEVEL_CHOICES[this.id] || _.get(this.stats, 'perfectShop.nextLevel');
        },

        setNextPSLevel(nextLevel) {
          LEVEL_CHOICES[this.id] = nextLevel;
        },

      },

    });

  });

})();
