(function () {

  const tags = [
    ['age3', '3 года', /[^0-9]3 года|тр[её]хлетний/, 'age'],
    ['age4', '4 года', /[^0-9]4 года|четыр[её]хлетний/, 'age'],
    ['age5', '5 лет', /[^0-9]5 лет|пятилетний/, 'age'],
    ['age12', '12 лет', /[^0-9]12 лет/, 'age'],
    ['age18', '18 лет', /[^0-9]18 лет/, 'age'],
    ['age25', '25 лет', /[^0-9]25 лет/, 'age'],

    ['rose', 'розовое', /розовый|розовое|розов\./i, 'color'],
    ['red', 'красное', /красн\.|красное|кр\.(?![^\d][\d]+)/i, 'color'],
    ['white', 'белое', /([^A-я]|^)бел[. ]|белое|белый/i, 'color'],

    ['semiDry', 'п/сух', /полусухое|п\/сух\.?/ig, 'taste'],
    ['semiSweet', 'п/сл', /п\/слад\.|полуслад[^ ,"]*|п\/сл[,.]+|п\/сл(?=[ ]|$)/ig, 'taste'],
    ['dry', 'сухое', /сухое|сух[.,]+|[ .,]+сух(?=[ ]|$)/i, 'taste'],
    ['sweet', 'сладкое', /([ ]|^)+сладк[^ ,"]*|сладкое|сл\./i, 'taste'],
    ['brut', 'брют', /брют/i, 'taste'],

    ['sparkling', 'игристое', /игристое/i, 'other'],
    ['gift', 'п/у', /подар[^ .]*|под[^ .]*[ .]{1,2}упа[^ .)]*|в п\/у[^ .)]*|п\/у[^ .)]*/i, 'other']
  ];

  angular.module('Models')
    .constant('ArticleTagRegs', tags)
    .run(ArticleTag);

  function ArticleTag(Schema) {

    const model = Schema.register({

      name: 'ArticleTag',

      relations: {
        hasOne: {
          ArticleTagGroup: {
            localField: 'group',
            localKey: 'groupId'
          }
        }
      }

    });


    _.each(tags, tag => {

      let [id, label, re, groupId] = tag;

      model.inject({id, label, re, groupId, code: id});

    });
    

  }

})();
