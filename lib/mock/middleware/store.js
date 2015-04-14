"use strict";

var fs = require('fs-extra')
  , path = require('path')
  , Store = require('../helpers/store');

module.exports = exports = function(options) {
  options = options || {};

  var cwd = options.cwd || process.cwd();

  return function(req, res, next) {
    fs.readJsonFile(path.join(cwd, 'store.json'), 'utf-8', function(err, storeJson) {
      res.locals.store = new Store(storeJson || {});
      next();
    });
  };

};
