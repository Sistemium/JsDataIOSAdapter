'use strict';

(function () {

  function IosParser() {

    function parseObject(row, model) {

      const fieldTypes = model && model.fieldTypes;

      _.each(fieldTypes, (type, field) => {

        row [field] = (function (v) {
          switch (type) {
            case 'int':
              return parseInt(v) || 0;
            case 'decimal':
              return parseFloat(v) || 0;
            case 'date':
              return v ? v.substr(0, 10) : null;
          }
        })(row[field]);

      });

      return row;

    }

    function parseArray(data, model) {

      const fieldTypes = model && model.fieldTypes;

      if (!fieldTypes) return;

      _.each(data, row => parseObject(row, model));

      return data;

    }

    return {
      parseObject,
      parseArray
    };

  }

  angular.module('Models')
    .service('IosParser', IosParser);

})();
