'use strict';

var fs = require('fs-extra')
  , path = require('path')
  , assign = require('lodash.assign')
  , lib = require('prostore.lib');

module.exports = exports = function (opts) {

  var cwd = opts.cwd;

  return function (req, res, next) {
    fs.readJson(path.join(cwd, 'store.json'), 'utf-8',
      function (err, store) {
        if (err)
          next(new Error('store.json not found. Try `prostore pull` first.'));
        store = store || {};
        res.locals.root = cwd;
        res.locals.store = store;
        lib.assets(path.join(cwd, 'assets'), function (ignoredErr, a1) {
          lib.assets(path.join(cwd, 'themes', store.themeId, 'assets'), function (ignoredErr, a2) {
            store.assets = assign({}, a2, a1);
            res.templateData = {
              store: res.locals.store
            };
            next();
          });
        });
      });
  };

};
