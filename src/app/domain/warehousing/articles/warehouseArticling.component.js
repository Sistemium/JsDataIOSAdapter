(function () {

  angular.module('Warehousing')
    .component('warehouseArticling', {
      bindings: {},

      controllerAs: 'vm',
      templateUrl: 'app/domain/warehousing/articles/warehouseArticling.html',

      controller: WarehouseArticlingController,

    });

  function WarehouseArticlingController($scope, saControllerHelper, Schema,
                                        BarCodeScanner) {

    const vm = saControllerHelper.setup(this, $scope);

    const { Article, ArticleBarCode } = Schema.models();

    vm.use({

      $onInit() {

        rebind();
        vm.setBusy(Article.findAll({}, {}));

        $scope.$on(BarCodeScanner.BARCODE_SCAN_EVENT, (e, { code }) => code && onScan(code));

      },

      clearBarcodeClick() {
        vm.barcode = null;
        rebind();
      },

    });

    function rebind() {
      const orderBy = [['name']];
      vm.rebindAll(Article, { orderBy }, 'vm.articles');
    }

    function onScan(code) {

      vm.barcode = code;

      return ArticleBarCode.findAll({ code }, { bypassCache: true })
        .then(articleBarCodes => {

          const where = {
            id: {
              in: _.uniq(articleBarCodes.map(item => item.articleId))
            },
          };

          const orderBy = [['name']];

          vm.rebindAll(Article, { orderBy, where }, 'vm.articles');

          return Article.findAll({ where }, { bypassCache: true });

        });

    }

  }

})();
