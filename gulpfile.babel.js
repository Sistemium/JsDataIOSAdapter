'use strict';

var config = {
  base: 'node_modules/sistemium-gulp'
};

require('babel-register')({
  ignore: function(filename) {
    return !/sistemium-gulp\/(gulp|[^\/]*js)/.test(filename);
  }
});

var gulp = require('gulp');

require('sistemium-gulp')
  .run(gulp, config);
