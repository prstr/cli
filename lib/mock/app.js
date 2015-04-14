"use strict";

var express = require('express');

module.exports = exports = function(opts) {

  var app = express();

  app.use(require('morgan')('dev'));
  app.use(require('./middleware/store')(opts));
  app.use(require('prostore.render')());

  app.use(require('prostore.base-router'));

  return app;

};
