'use strict';

(function () {

  angular.module('webPage')
    .service('models',function(DS, IosAdapter, $log){

      DS.registerAdapter('ios', new IosAdapter(), {default: true});

      var Article = DS.defineResource({
        name: 'Article',
        relations: {
          belongsTo: {
            ArticleGroup: {
              localField: 'ArticleGroup',
              localKey: 'articleGroup'
            }
          }
        }
      });

      var ArticleGroup = DS.defineResource({
        name: 'ArticleGroup',
        relations: {
          hasMany: {
            Article: {
              localField: 'Articles',
              foreignKey: 'articleGroup'
            }
          }
        }
      });

      var schema = {
        Article: Article,
        ArticleGroup: ArticleGroup
      };

      $log.log (schema);

      return schema;

    });

}());
