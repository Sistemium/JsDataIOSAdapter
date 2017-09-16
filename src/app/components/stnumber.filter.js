(function () {

  angular.module('core.services')
    .filter('stnumber', function ($filter) {

      return function stnumberFilter(input, minDecimals) {

        minDecimals = minDecimals || 0;

        let out = $filter('number')(input);

        out = _.replace(out, ',', '.');

        if (out && minDecimals) {

          let decimals = out.match(/.*([.])([0-9]+)/) || [0, '', ''];

          if (!decimals[1]) {
            out += '.';
          }

          if (decimals[2].length < minDecimals) {
            out += _.repeat('0', minDecimals - decimals[2].length);
          }

        }

        return out;

      };
    });

})();
