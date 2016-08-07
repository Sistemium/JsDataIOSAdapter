'use strict';

var config = {
  base: 'node_modules/sistemium-gulp'
};

var gulp = require('gulp');

require('sistemium-gulp')
  .run(gulp, config);
