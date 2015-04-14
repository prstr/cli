"use strict";

var fs = require('fs-extra')
  , path = require('path')
  , Store = require('../helpers/store');

module.exports = exports = function(options) {
  options = options || {};

  var cwd = options.cwd || process.cwd();
  var storeJson = fs.readJsonFileSync(path.join(cwd, 'store.json'), 'utf-8');
  var store = new Store(storeJson || {}, cwd);

  return function(req, res, next) {
    res.locals.store = store;
    next();
  };

};
