(function () {

  angular.module('Sales')
    .service('Cataloguing', Cataloguing);

  function Cataloguing(Schema, moment) {

    const { Campaign } = Schema.models();

    return {

      campaignsByArticle(params) {

        const today = moment().format();

        const where = {
          dateB: { '<=': today, },
          dateE: { '>=': today },
        };

        return Campaign.findAll({ where })
          .then(res => _.filter(res, campaign => campaign.appliesTo(params)))
          .then(variantsToArticlesHash);

      },

    };

  }

  function variantsToArticlesHash(campaigns) {

    const allVariants = _.flatten(_.map(campaigns, ({ variants, id, discount }) => {
      return _.map(variants, variant => _.assign({ campaignId: id, discount }, variant));
    }));

    const byArticles = _.flatten(_.map(allVariants, variant => {
      return _.map(variant.articleIds, articleId => ({ articleId, variant }));
    }));

    const grouped = _.groupBy(byArticles, 'articleId');

    return _.mapValues(grouped, variants => _.map(variants, 'variant'));

  }

})();
