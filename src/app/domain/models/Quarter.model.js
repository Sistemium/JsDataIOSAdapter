'use strict';

(function () {

  angular.module('Models').run(Quarter);

  function Quarter(Schema, moment) {

    const model = Schema.register({

      name: 'Quarter',

      methods: {},

      meta: {
        initData() {
          _.each(items, item => model.inject(item));
        },
        getCurrent() {

          const today = moment().format('YYYY-MM-DD');

          const current = model.filter({
            where: {
              dateB: { '<=': today },
              dateE: { '>=': today },
            },
          });

          return _.first(current);

        },
      }

    });

    const items = [
      {
        id: '2019-1',
        name: '1й квартал 2019',
        dateB: '2019-01-01',
        dateE: '2019-03-31',
      }, {
        id: '2019-2',
        name: '2й квартал 2019',
        dateB: '2019-04-01',
        dateE: '2019-06-30',
      }, {
        id: '2019-3',
        name: '3й квартал 2019',
        dateB: '2019-07-01',
        dateE: '2019-09-30',
      },
    ];

    model.meta.initData();

  }

})();
