'use strict';

(function () {

  angular.module('webPage').component('catalogueSearchButtons', {

    bindings: {},
    templateUrl: 'app/domain/components/catalogueSearchButtons/catalogueSearchButtons.html',

    controller: catalogueSearchButtonsController,
    controllerAs: 'vm'

  });

  function catalogueSearchButtonsController($scope, Schema, saControllerHelper) {

    const {Article} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      $onInit,
      alphabetLetterClick,
      subLetterClick,
      changeLangClick,

      subLetter: null,
      filteredArticles: null,
      currentLetter: null,
      currentLanguage: 'Rus'

    });

    function $onInit() {
      getArticles();
    }

    function changeLangClick() {

      if (vm.currentLanguage === 'Eng') {
        vm.currentLanguage = 'Rus';
      } else {
        vm.currentLanguage = 'Eng';
      }

      vm.currentLetter = null;
      vm.filteredArticles = null;

      extractWords();

    }

    function subLetterClick(subLetter) {

      let reg = new RegExp('^' + subLetter, 'i');

      vm.subLetter = subLetter;
      vm.filteredArticles = _.filter(vm.articlesByAlphabet[vm.currentLetter], word => reg.test(word));

    }

    function alphabetLetterClick(letter) {

      if (vm.currentLetter !== letter) {
        vm.currentLetter = letter;

        let filteredWords = _.get(vm.articlesByAlphabet, vm.currentLetter);

        vm.subLetters = _.uniq(_.map(filteredWords, word => _.lowerCase(word.slice(0, 2))));

      } else {
        vm.currentLetter = null;
        vm.subLetters = null;
      }

      vm.subLetter = null;
      vm.filteredArticles = null;

    }

    function getArticles() {

      vm.busy = Article.findAll()
        .then(() => extractWords())

    }

    function extractWords() {

      let pre = _.map(Article.getAll(), article => _.words(article.name));
      let regExp;

      if (vm.currentLanguage === 'Eng') {
        regExp = /[A-Z]/;
      } else {
        regExp = /[А-Я]/;
      }

      let words = _.orderBy(_.uniq(_.filter(_.flatten(pre), word => word.length > 2 && regExp.test(word[0]))));

      vm.articlesByAlphabet = _.groupBy(words, _.first);

      vm.alphabet = _.map(vm.articlesByAlphabet, (val, key) => key);

    }

  }

}());

