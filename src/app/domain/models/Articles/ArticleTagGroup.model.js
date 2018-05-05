(function () {

  angular.module('Models')
    .run(ArticleTagGroup);

  function ArticleTagGroup(Schema) {

    const data = [
      ['age', 'Выдержка'],
      ['color', 'Цвет'],
      ['taste', 'Вкус'],
      ['other', 'Прочее', true],
      ['etc', '', true]
    ];

    const model = Schema.register({

      name: 'ArticleTagGroup',

      relations: {
        hasMany: {
          ArticleTag: {
            localField: 'tags',
            foreignKey: 'groupId'
          }
        }
      },

      meta: {}

    });

    _.each(data, (item, idx) => {

      let [id, name, allowMultiple = false] = item;

      model.inject({id, name, allowMultiple, ord: idx + 1});

    });

  }

})();
