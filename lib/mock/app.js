'use strict';

var express = require('express')
  , path = require('path')
  , Theme = require('prostore.theme-api');

module.exports = exports = function (opts) {

  var app = express()
    , cwd = opts.cwd;

  // Request logger
  app.use(require('morgan')('dev'));

  // Mocks middleware
  app.use(require('./store')(opts));
  app.use(require('./assets')(opts));
  app.use(require('./mockdata')(opts));
  app.use(require('./compiler')(opts));

  // Store static
  app.use('/static', express.static(path.join(cwd, 'static')));
  app.use(express.static(path.join(cwd, 'static')));

  // Theme static
  app.use('/static', function (req, res, next) {
    var store = res.locals.store;
    if (!store.themeId)
      return next();
    var root = path.join(cwd, 'themes', store.themeId, 'static');
    express.static(root)(req, res, next);
  });

  // Theme middleware
  app.get('/stylesheets/*', function (req, res, next) {
    var themeId = res.locals.store.themeId;
    var root = themeId ? path.join(cwd, 'themes', themeId) : cwd;
    var theme = new Theme(root);
    theme.middleware(req, res, next);
  });

  // Templates compiler
  app.use(require('prostore.render')());

  // Mock routes
  app.use(require('./routes'));

  // Site mockup
  app.use(require('prostore.site-router'));

  return app;

};
