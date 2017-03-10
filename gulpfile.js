'use strict';

require('sistemium-gulp')
  .config({
    ngModule: 'webPage',
    browserSync: {
      port: 3000,
      ui: {
        port: 3001
      },
      ghostMode: false,
      reloadOnRestart: false,
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
