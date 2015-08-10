'use strict';

var express = require('express')
  , path = require('path')
  , lib = require('prostore.lib');

module.exports = exports = function (opts) {

  var app = express()
    , cwd = opts.cwd;

  // Request logger
  app.use(require('morgan')('dev'));

  // Mocks middleware
  app.use(require('./store')(opts));
  app.use(require('./mockdata')(opts));
  app.use(require('./compiler')(opts));

  // Serve /
  app.get('/', function (req, res, next) {
    lib.site(req, res, function () {
      req.url = '/products';
      next();
    });
  });

  // Store static
  app.use(express.static(path.join(cwd, 'static')));
  app.use('/static', express.static(path.join(cwd, 'static')));
  app.use('/static', function (req, res, next) {
    var store = res.locals.store;
    if (!store.themeId)
      return next();
    var root = path.join(cwd, 'themes', store.themeId, 'static');
    express.static(root)(req, res, next);
  });

  // Templates compiler
  app.use(lib.render());

  // Mock routes
  app.use(require('./routes'));

  // Site mockup
  app.use(lib.site);

  return app;

};
