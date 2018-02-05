'use strict';

(function () {

  angular.module('Models').run(function (Schema, Auth, moment) {

    Schema.register({

      name: 'NewsMessage',

      relations: {

        hasOne: {
          UserNewsMessage: {
            localField: 'userNewsMessage',
            foreignKey: 'newsMessageId'
          },
          Account: {
            localField: 'authorAccount',
            localKey: 'authorId'
          }
        },

        hasMany: {
          NewsMessagePicture: {
            localField: 'pictures',
            foreignKey: 'newsMessageId'
          }
        }

      },

      computed: {
        rating: ['ratingsTotal', 'ratingsCount', commonRating]
      },

      methods: {
        isAuthor,
        isUnrated,
        htmlView,
        hasUnreadComments
      },

      meta: {
        ratingTitles: ['Плохо', 'Так себе', 'Нормально', 'Хорошо', 'Отлично'],
        filterActual,
        filterPast,
        filterFuture
      }

    });

    function hasUnreadComments(stats = {}) {
      return _.get(stats[this.id], 'max(timestamp)') > (_.get(this.userNewsMessage, 'lastReadCommentaries') || '');
    }

    function htmlView() {

      let {body} = this;

      body = body.replace(/(\()([^\n)]+)(\)=)([a-z]+)/g, '<span class="$4">$2</span>');
      body = body.replace(/(!)([^ \n!][^\n!]+)(!)/g, '<em>$2</em>');
      body = body.replace(/(\|)([^ \n|][^\n|]+)(\|)/g, '<mark>$2</mark>');
      body = body.replace(/(\*)([^ \n*][^*\n]+)(\*)/g, '<b>$2</b>');
      body = body.replace(/(_)([^ \n_][^\n_]+)(_)/g, '<ins>$2</ins>');

      return body;

    }

    function isUnrated() {
      return !this.isAuthor() && !_.get(this, 'userNewsMessage.rating');
    }

    function  commonRating(ratingsTotal, ratingsCount) {
      return ratingsCount ? (ratingsTotal / ratingsCount).toFixed(1) : null;
    }

    function isAuthor() {
      return Auth.authId() === this.authId;
    }

    function filterActual(filter) {

      let today = moment().format();

      return _.assign({
        where: {
          dateB: {
            '<=': today
          },
          dateE: {
            '>=': today
          }
        }
      }, filter);

    }

    function filterFuture(filter) {

      let today = moment().format();

      return _.assign({
        where: {
          dateB: {
            '>': today
          }
        }
      }, filter);

    }

    function filterPast(filter) {

      let today = moment().format();

      return _.assign({
        where: {
          dateE: {
            '<': today
          }
        }
      }, filter);

    }

  });

})();
