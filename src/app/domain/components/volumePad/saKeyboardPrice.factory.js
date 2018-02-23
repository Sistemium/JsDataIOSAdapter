(function () {

  angular.module('webPage')
    .factory('saKeyboardPrice', saKeyboardPrice);

  function saKeyboardPrice() {

    return function () {
      return {
        disableButton,
        formatSymbols,
        importModel,
        exportSymbols
      };
    };

    function disableButton(button, data, modelMax, touched) {

      if (!touched) return false;

      if (button.remove) {
        return !data;
      }

      if (modelMax) {

        if (exportSymbols(`${touched ? data : ''}${button.label}`) > modelMax) {
          return true;
        }

      }

      if (button.label === ',') {
        return /,/.test(data);
      }

      return button.label && /,\d{2}/.test(data);

    }

    function formatSymbols(str) {

      if (_.first(str) === ',') {
        return `0${str}`;
      }

      return str;
    }

    function importModel(number) {
      let res = (number || 0).toFixed(2).replace(/\./, ',');
      return res.replace(/,00|(,[^0]?)0*$/, '$1');
    }

    function exportSymbols(str) {
      str = str && str.replace(/,$/, '');
      return parseFloat((str || '0').replace(/,/, '.'));
    }


  }

})();
