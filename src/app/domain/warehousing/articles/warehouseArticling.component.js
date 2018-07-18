(function () {

  angular.module('Warehousing')
    .component('warehouseArticling', {
      bindings: {},

      controllerAs: 'vm',
      templateUrl: 'app/domain/warehousing/articles/warehouseArticling.html',

      controller: WarehouseArticlingController,

    });

  function WarehouseArticlingController($scope, saControllerHelper, Schema,
                                        BarCodeScanner, $state, DEBUG, $q, toastr, ConfirmModal,
                                        SoundSynth) {

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

      onSearchClick,

    })
      .watchScope('vm.search', rebind);

    /*
    Functions
     */

    function onSearchClick() {

      const { search } = vm;

      if (hasBarcodeFilter.test(search)) {
        vm.search = 'Нет штрих-кода';
      } else {
        vm.search = 'Есть штрих-код';
      }

    }

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

    const hasNoBarcodeFilter = /Нет штрих-кода/i;
    const hasBarcodeFilter = /Есть штрих-код/i;

    function rebind(filterOrSearch = '') {

      const orderBy = [['name']];
      const { code, barcode } = filterOrSearch;

      if (filterOrSearch === vm.barcode) {
        return;
      }

      let where = _.isString(filterOrSearch)
        ? { name: { likei: `%${filterOrSearch}%` } }
        : {};

      if (!filterOrSearch) {
        where = {};
      } else if (code) {
        vm.search = code;
        vm.barcode = code;
        where.code = { '==': code };
      } else if (barcode) {
        vm.search = barcode;
        vm.barcode = barcode;
        where.barcodes = { 'contains': barcode };
      } else if (hasBarcodeFilter.test(filterOrSearch)) {
        where = {
          'barcodes.length': {
            '>': 0
          },
        };
      } else if (hasNoBarcodeFilter.test(filterOrSearch)) {
        where = {
          'barcodes.length': {
            '==': 0
          },
        };
      }

      const filter = _.assign({ orderBy }, { where });

      return $q(resolve => {
        vm.rebindAll(Article, filter, 'vm.articles', () => resolve(vm.articles));
      });

    }

    function onScan(code, { type } = {}) {

      DEBUG('WarehouseArticlingController', code, type);

      if (!type) {
        return sayInvalid();
      }

      if (BARCODE_TYPES.indexOf(type) === -1) {
        return sayInvalid();
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
        .then(setArticles);

    }

    function setArticles(articles) {

      DEBUG('setArticles', articles.length);

      if (!vm.articles.length) {
        sayNotFound();
      } else if (vm.articles.length === 1) {
        const { id } = vm.articles[0];
        if (id === $state.params.articleId) {
          return saySameArticle();
        }
        stateGo(id);
      } else {
        sayChooseArticle();
        stateGo();
      }

    }

    function addBarcode(barcode) {

      const { articleId } = $state.params;

      const article = Article.get(articleId);

      if (!article) {
        return;
      }

      article.barcodes.push(barcode);

      article.DSCreate()
        .then(sayAdded);

    }

    function checkBarcodeUnique(barcode) {

      const where = { barcodes: { 'contains': barcode } };
      const { articleId: id } = $state.params;
      const article = Article.get(id);

      const { barcodes = [] } = article;

      if (barcodes.indexOf(barcode) >= 0) {
        return $q.reject(sayBarcodeAlreadyBound());
      }

      const articles = _.filter(Article.filter({ where: where }), a => a.id !== id);

      if (articles.length) {
        sayNotUnique();
        return ConfirmModal.show({
          title: barcode,
          text: `Штрих-код уже привязан к [${articles[0].name}], добавить дубликат?`,
        });
      }

      if (barcodes.length) {
        sayThereIsBarcode();
        return ConfirmModal.show({
          title: 'У товара уже есть штрих-код',
          text: 'Добавить еще один?',
        });
      }

      return $q.resolve();

    }

    function onArticleScan(barcode) {

      if (vm.busy) {
        return sayBusy();
      }

      if (stateName() === 'view') {
        vm.busy = true;
        return checkBarcodeUnique(barcode)
          .then(() => addBarcode(barcode))
          .catch(_.noop)
          .finally(() => vm.busy = false);
      }

      rebind({ barcode })
        .then(setArticles);

    }

    function sayNotFound() {
      SoundSynth.say('Товар не найден');
    }

    function saySameArticle() {
      SoundSynth.say('Такой же товар');
    }

    function sayChooseArticle() {
      SoundSynth.say('Выберите товар, подходит несколько');
    }

    function sayThereIsBarcode() {
      SoundSynth.say('Уже есть штрих-код');
    }

    function sayAdded() {
      SoundSynth.say('Добавлено');
    }

    function sayNotUnique() {
      SoundSynth.say('Штрих-код назначен другому товару');
    }

    function sayBarcodeAlreadyBound() {
      SoundSynth.say('Штрих-код уже привязан к этому товару');
    }

    function sayInvalid() {
      SoundSynth.say('Непонятный штрих-код');
    }

    function sayBusy() {
      SoundSynth.say('Выберите ответ на экране');
    }

  }

})();
