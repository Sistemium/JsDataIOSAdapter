(function () {

  angular.module('Models').run(Responsibility);

  function Responsibility(Schema, localStorageService) {

    const lsKey = 'Responsibility';

    const data = localStorageService.get(lsKey) || {};

    const model = Schema.register({

      name: 'Responsibility',

      methods: {

        toggle: function () {

          data[this.id] = this.flagged = !this.flagged;

          if (!toggled().length) {
            _.each(model.getAll(), item => {
              if (item.id !== this.id) {
                data[item.id] = item.flagged = true;
              }
            });
          }

          localStorageService.set(lsKey, data);

        }

      },

      meta: {

        toggled,

        jsdFilter: function() {

          let responsibility = toggled();

          let where = {
            responsibility: {'==': responsibility}
          };

          return responsibility.length ? where : false;

        }
      }

    });

    const items = [
      {
        id: 'op',
        name: 'ОП'
      }, {
        id: 'mvz',
        name: 'МВЗ'
      }, {
        id: 'etp',
        name: 'ЭТП'
      }
    ];

    _.each(items, item => {
      item.flagged = data[item.id];
      if (_.isUndefined(item.flagged)) {
        item.flagged = true;
      }
      data[item.id] = item.flagged;
      model.inject(item);
    });

    localStorageService.set(lsKey, data);

    function toggled() {
      return _.map(model.filter({flagged: true}), item => item.id);
    }

  }

})();
