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
    }

  }));

  function maskRe(mask) {
    return new RegExp(mask);
  }

})();
