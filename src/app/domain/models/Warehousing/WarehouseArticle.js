/* global Long:false */

(function () {

  angular.module('Warehousing').run(Schema => {

    Schema.register({

      name: 'WarehouseArticle',

      relations: {
        belongsTo: {
          Producer: {
            localField: 'producer',
            localKey: 'producerId',
          },
        }
      },

      meta: {

        alcCodeByExciseStamp

      },

    });

  });

  const sym = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function alcCodeByExciseStamp(barcode) {

    let res = _.slice(barcode, 7, 7 + 12);
    let resInt = new Long(0, 0);

    for (let x = 1; x <= 12; x++) {

      const m = Math.pow(36, 12 - x);

      const part = res[x - 1];
      const pos = sym.indexOf(part);

      resInt = resInt.add(pos * m);

    }

    res = resInt.toString();

    return _.repeat('0', 19 - res.length) + res;

  }


})();
