'use strict';

require('sistemium-gulp')
  .config({
    ngModule: 'webPage',
    browserSync: {
      ghostMode: false
    },
    build: {
      replace: {
        js: {
          '\'//api-maps.yandex.ru': '\'https://api-maps.yandex.ru'
        }
      }
    }
  })
  .run(require('gulp'));
