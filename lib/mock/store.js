"use strict";

var fs = require('fs-extra')
  , path = require('path');

module.exports = exports = function(opts) {

  var cwd = opts.cwd;

  return function(req, res, next) {
    fs.readJsonFile(path.join(cwd, 'store.json'), 'utf-8', function(err, obj) {
      res.locals.store = obj || {};
      res.locals.root = cwd;
      res.templateData = {
        store: res.locals.store
      };
      next();
    });
  };

};
