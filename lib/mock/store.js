'use strict';

var fs = require('fs-extra')
  , path = require('path')
  , _ = require('underscore');

module.exports = exports = function (opts) {

  var cwd = opts.cwd;

  return function (req, res, next) {
    fs.readJson(path.join(cwd, 'store.json'), 'utf-8',
      function (ignoredErr, store) {
        store = store || {};
        res.locals.store = store;
        res.locals.root = cwd;
        var storeAssets = path.join(cwd, 'assets.json');
        var themeAssets = path.join(cwd, 'themes', store.themeId, 'assets.json');
        fs.readJson(storeAssets, 'utf-8', function (ignoredErr, a1) {
          fs.readJson(themeAssets, 'utf-8', function (ignoredErr, a2) {
            store.assets = _.extend({
              'app/store.js': '/app/store.js',
              'app/my.js': '/app/my.js'
            }, a2, a1);
            res.templateData = {
              store: res.locals.store
            };
            next();
          });
        });
      });
  };

};
