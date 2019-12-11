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

    const allVariants = _.flatten(_.map(campaigns, campaignToVariants));

    const byArticles = _.flatten(_.map(allVariants, variant => {
      return _.map(variant.articleIds, articleId => ({ articleId, variant }));
    }));

    const grouped = _.groupBy(byArticles, 'articleId');

    return _.mapValues(grouped, variants => _.map(variants, 'variant'));

  }

  function campaignToVariants(campaign) {
    const { variants, id, discount, name } = campaign;
    const data = _.map(variants, (variant, idx) => {
      const variantNumber = (variants.length > 1) ? emojiNumber(idx + 1) : '';
      const cname = (variants.length > 1) ? `${name} ${variantNumber}` : name;
      return _.defaults({
        campaignId: id,
        discount,
        name: cname,
        campaignName: name,
        variantName: variant.name,
        variantNumber,
        variantDiscount,
      }, variant);
    });
    return _.orderBy(data, 'name');
  }

  function variantDiscount(articleId) {
    const { discount, articles } = this;
    if (discount) {
      return discount;
    }
    const condition = _.find(articles, ({ articleIds }) => articleIds.indexOf(articleId) > -1);
    return _.get(condition, 'discount') || 0;
  }

  function emojiNumber(number) {
    return _.map(number.toString(), char => `${char}️⃣`).join('');
  }

})();
