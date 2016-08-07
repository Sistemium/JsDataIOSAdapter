'use strict';

var config = {
  base: 'node_modules/sistemium-gulp'
};

require('babel-register')({
  ignore: function(filename) {
    if (/node_modules\/sistemium-gulp/.test(filename)) {
      return false;
    } else {
      return true;
    }
  }
});

var gulp = require('gulp');

require('sistemium-gulp')
  .run(gulp, config);
