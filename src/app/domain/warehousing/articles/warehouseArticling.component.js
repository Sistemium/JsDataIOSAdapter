(function () {

  angular.module('Warehousing')
    .component('warehouseArticling', {
      bindings: {},

      controllerAs: 'vm',
      templateUrl: 'app/domain/warehousing/articles/warehouseArticling.html',

      controller: WarehouseArticlingController,

    });

  function WarehouseArticlingController($scope, saControllerHelper, Schema,
                                        BarCodeScanner, $state, DEBUG, $q) {

    const vm = saControllerHelper.setup(this, $scope);

    const { WarehouseArticle: Article, ArticleBarCode, BarCodeType } = Schema.models();

    const {
      BARCODE_TYPE_ARTICLE,
      BARCODE_TYPE_EXCISE_STAMP,
    } = BarCodeType.meta.types;

    const BARCODE_TYPES = [BARCODE_TYPE_ARTICLE, BARCODE_TYPE_EXCISE_STAMP];

    vm.use({

      $onInit() {

        rebind();
        vm.setBusy(Article.findAll({}, { limit: 10000 }));

        $scope.$on(BarCodeScanner.BARCODE_SCAN_EVENT, (e, { code, type }) => code && onScan(code, type));

      },

      clearSearchClick() {
        vm.barcode = null;
        vm.search = '';
      },

      articleClick(article) {
        $state.go('wh.articling.view', { articleId: article.id });
      },

    })
      .watchScope('vm.search', rebind);

    function rebind(filterOrSearch = '') {

      const orderBy = [['name']];
      const { code, barcode } = filterOrSearch;

      if (filterOrSearch === vm.barcode) {
        return;
      }

      let where = _.isString(filterOrSearch)
        ? { name: { likei: `%${filterOrSearch}%` } }
        : {};

      if (code) {
        vm.search = code;
        vm.barcode = code;
        where.code = { '==': code };
      } else if (barcode) {
        vm.search = barcode;
        vm.barcode = barcode;
        where.barcodes = { 'contains': barcode };
      }

      if (!filterOrSearch) {
        where = {};
      }

      const filter = _.assign({ orderBy }, { where });

      return $q(resolve => {
        vm.rebindAll(Article, filter, 'vm.articles', () => resolve(vm.articles));
      });

    }

    function onScan(code, { type } = {}) {

      DEBUG('WarehouseArticlingController', code, type);

      if (!type) {
        return;
      }

      if (BARCODE_TYPES.indexOf(type) === -1) {
        return;
      }

      if (type === BARCODE_TYPE_ARTICLE) {
        return onArticleScan(code);
      }

      if (type === BARCODE_TYPE_EXCISE_STAMP) {
        return onExciseStampScan(code);
      }


    }

    function onExciseStampScan(code) {

      const articleCode = Article.meta.alcCodeByExciseStamp(code);

      DEBUG('onExciseStampScan', articleCode);

      rebind({ code: articleCode })
        .then(articles => {

          DEBUG('onExciseStampScan', articles.length);

          if (vm.articles.length === 1) {
            stateGo(vm.articles[0].id);
          } else {
            stateGo();
          }

        });

    }

    function stateGo(id) {
      return $state.go(`wh.articling${ id ? '.view' : ''}`, id ? { articleId: id } : {});
    }

    function onArticleScan(barcode) {

      rebind({ barcode })
        .then(articles => {

          DEBUG('onBarcodeScan', articles.length);

          if (vm.articles.length === 1) {
            stateGo(vm.articles[0].id);
          } else {
            stateGo();
          }

        });

    }

  }

})();
