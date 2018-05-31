(function () {

  angular.module('Models').run(Schema => Schema.register({

    name: 'BarCodeType',

    computed: {
      maskRe: ['mask', maskRe],
    },

    methods: {
      match(code) {
        return this.maskRe.test(code);
      }
    },

    meta: {
      types: {
        BARCODE_TYPE_ARTICLE: 'Article',
        BARCODE_TYPE_STOCK_BATCH: 'StockBatch',
        BARCODE_TYPE_EXCISE_STAMP: 'ExciseStamp',
      }
    }

  }));

  function maskRe(mask) {
    return new RegExp(mask);
  }

})();
