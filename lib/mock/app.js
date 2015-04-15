"use strict";

var express = require('express')
  , path = require('path');

module.exports = exports = function(opts) {

  var app = express();

  // Request logger
  app.use(require('morgan')('dev'));

  // Store static
  app.use(express.static(path.join(opts.cwd, 'static')));

  // Theme static
  app.use(function(req, res, next) {
    var store = res.locals.store;
    if (!store.themeId)
      next();
    var root = path.join(opts.cwd, 'themes', store.themeId, 'static');
    express.static(root)(req, res, next);
  });

  // Site mockup
  app.use(require('prostore.site-router'));

  return app;

};
