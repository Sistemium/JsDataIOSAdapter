(function () {

  angular.module('Warehousing')
    .component('warehouseArticling', {
      bindings: {},

      controllerAs: 'vm',
      templateUrl: 'app/domain/warehousing/articles/warehouseArticling.html',

      controller: WarehouseArticlingController,

    });

  function WarehouseArticlingController($scope, saControllerHelper, Schema,
                                        BarCodeScanner, $state, DEBUG, $q, toastr, ConfirmModal) {

    const vm = saControllerHelper.setup(this, $scope);

    const { WarehouseArticle: Article, Producer, BarCodeType } = Schema.models();

    const {
      BARCODE_TYPE_ARTICLE,
      BARCODE_TYPE_EXCISE_STAMP,
    } = BarCodeType.meta.types;

    const BARCODE_TYPES = [BARCODE_TYPE_ARTICLE, BARCODE_TYPE_EXCISE_STAMP];

    vm.use({

      $onInit() {

        rebind();
        vm.setBusy([
          Article.findAll({}, { limit: 10000 }),
          Producer.findAll(),
        ]);

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

    /*
    Functions
     */

    function stateGo(id) {
      return $state.go(`wh.articling${ id ? '.view' : ''}`, id ? { articleId: id } : {});
    }

    function stateName() {
      const { currentState } = vm;

      switch (currentState) {
        case 'articling':
          return 'root';
        case 'create':
        case 'view':
          return currentState;

      }
    }

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

    function addBarcode(barcode) {

      const { articleId } = $state.params;

      const article = Article.get(articleId);

      if (!article) {
        return;
      }

      const { barcodes } = article;

      if (barcodes.indexOf(barcode) >= 0) {
        return toastr.error(barcode, 'Штрих-код уже привязан к этому товару');
      }

      article.barcodes.push(barcode);

      article.DSCreate();

    }

    function checkBarcodeUnique(barcode) {

      const where = { barcodes: { 'contains': barcode } };
      const { articleId: id } = $state.params;

      const articles = _.filter(Article.filter({ where: where }), a => a.id !== id);

      if (articles.length) {
        return ConfirmModal.show({
          title: barcode,
          text: `Штрих-код уже привязан к [${articles[0].name}], добавить дубликат?`,
        });
      }

      return $q.resolve();

    }

    function onArticleScan(barcode) {

      if (stateName() === 'view') {
        return checkBarcodeUnique(barcode)
          .then(() => addBarcode(barcode))
          .catch(_.noop);
      }

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
