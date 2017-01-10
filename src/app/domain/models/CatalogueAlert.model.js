'use strict';

(function () {

  angular.module('Models').run(function (Schema, toastr) {

    const defaultOptions = {timeOut: 10000};

    const CatalogueAlert = Schema.register({

      name: 'CatalogueAlert',

      relations: {
        hasOne: {
          ArticleGroup: {
            localField: 'articleGroup',
            localKey: 'articleGroupId'
          }
        }
      },

      meta: {},
      omit: ['lastShown'],

      methods: {

        show: function () {
          this.lastShown = moment();
          return toastr[this.style || 'warning'](this.text, this.title, this.options || defaultOptions);
        }

      }

    });

  });

})();
