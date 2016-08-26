'use strict';

require('sistemium-gulp')
  .config({
    ngModule: 'webPage',
    browserSync: {
      ghostMode: false
    }
  })
  .run(require('gulp'));
