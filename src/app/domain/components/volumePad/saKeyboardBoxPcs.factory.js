(function () {

  angular.module('webPage')
    .factory('saKeyboardBoxPcs', saKeyboardBoxPcs);

  function saKeyboardBoxPcs() {

    return function () {
      return {
        disableButton,
        formatSymbols,
        importModel,
        exportSymbols
      };
    };

    function disableButton(button, data) {
      if (button.label === 'К') {
        // TODO: maybe need no g
        if (!data || /К/g.test(data)) {
          return true;
        }
      }
    }

    function formatSymbols(str) {

      str = _.replace(str, / /g, '');
      let re = /(\d*)(К|^)(\d*)/;

      return (str || '').replace(re, (match, box, k, pcs) => {
        return (box ? box + ' К' : '') + (box && pcs && ' ' || '') + (pcs ? pcs + ' б' : '');
      });

    }

    function importModel(num, boxRel) {

      let box = boxRel > 1 ? Math.floor(1.0 * num / boxRel) : 0;
      let pcs = boxRel > 1 ? num % boxRel : num;

      return (box ? box + 'К' : '') + (pcs || '');

    }

    function exportSymbols(str, boxRel) {

      let re = /(\d*)(К|^)(\d*)/;
      let m = (str || '').match(re);
      return parseInt(m[1] || '0') * boxRel + parseInt(m[3] || '0');

    }


  }

})();
