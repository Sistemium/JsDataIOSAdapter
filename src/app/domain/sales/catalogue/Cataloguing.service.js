(function () {

  angular.module('Sales')
    .service('Cataloguing', Cataloguing);

  function Cataloguing(Schema, moment, $q) {

    const { Campaign } = Schema.models();

    return {

      findVariants(ids) {

        return $q.all(ids.map(id => {
          return Campaign.meta.findByVariantId(id)
            .then(campaign => {
              if (!campaign) {
                return;
              }
              const { name: campaignName, variants, discount } = campaign;
              const { name: variantName } = _.find(variants, { id }) || {};
              const name = discount ? campaignName : `${campaignName} - ${variantName}`;
              return { name, id };
            });
        }))
          .then(_.filter);

      },

      campaignsByArticle(params) {

        const today = moment().format();

        const where = {
          dateB: { '<=': today, },
          dateE: { '>=': today },
        };

        return Campaign.findAll({ where })
          .then(res => _.filter(res, ({ restrictions }) => appliesTo(restrictions, params)))
          .then(res => variantsToArticlesHash(res, params));

      },

    };

  }

  function variantsToArticlesHash(campaigns, params) {

    const allVariants = _.filter(_.flatten(_.map(campaigns, campaignToVariants)));

    const byArticles = _.flatten(_.map(allVariants, variant => {
      return _.map(variant.articleIds, articleId => ({ articleId, variant }));
    }));

    const grouped = _.groupBy(byArticles, 'articleId');

    return _.mapValues(grouped, variants => _.map(variants, 'variant'));

    function campaignToVariants(campaign) {
      const { variants, id, discount, name } = campaign;
      const matching = _.filter(variants, v => appliesTo(v.restrictions, params));
      const data = _.map(matching, (variant, idx) => {
        const variantNumber = (variants.length > 1) ? emojiNumber(idx + 1) : '';
        const cname = (variants.length > 1) ? `${name} ${variantNumber}` : name;
        return _.defaults({
          campaignId: id,
          discount,
          name: cname,
          campaignName: _.replace(name, /_/g, ' '),
          variantName: _.replace(variant.name === name ? '' : variant.name, /_/g, ' '),
          variantNumber,
          variantDiscount,
        }, variant);
      });
      return _.orderBy(data, 'name');
    }

  }

  function variantDiscount(articleId) {
    const { discount, articles } = this;
    if (discount) {
      return discount;
    }
    const condition = _.find(articles, a => a.articleIds.indexOf(articleId) > -1);
    return _.get(condition, 'discount') || 0;
  }

  function emojiNumber(number) {
    return _.map(number.toString(), char => `${char}️⃣`).join('');
  }


  function restrictionsRules(restrictions) {

    return [
      checkRestriction('outletId'),
      checkRestriction('partnerId'),
      checkRestriction('salesmanId'),
    ];

    function checkRestriction(name) {
      const ids = restrictions[`${name}s`];
      return params => {
        return ids && ids.length && !(params && ids.indexOf(params[name]));
      }
    }

  }

  function appliesTo(restrictions, params) {
    if (!restrictions) {
      return true;
    }
    return !_.find(restrictionsRules(restrictions), rule => rule(params));
  }

})();
