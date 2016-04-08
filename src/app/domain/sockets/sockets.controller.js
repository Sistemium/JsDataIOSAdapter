'use strict';

(function () {

  angular.module('webPage')
    .controller('SocketsController', function (models) {

      var vm = this;
      var Article = models.Article;

      Article.findAll({}).then(function (data) {
        vm.data = data;
      }).catch(function (err) {
        vm.err = err;
      });

      var article = {
        "name": "test",
        "code": "БС000011525",
        "packageRel": 6,
        "pieceVolume": 0.75,
        "extraLabel": null,
        "articleGroup": "4d6f4feb-47fc-11e5-9499-005056851d41",
        "productionInfoType": 1,
        "firstName": "\"Мускат Белый Массандра\"",
        "category": "Винный напиток",
        "factory": " Массандра ",
        "lastName": "спец. бел.  Россия"
      };
      Article.create(article).then(function (data) {
        vm.data = data;
      }).catch(function (err) {
        vm.err = err;
      });
    })
  ;

}());
