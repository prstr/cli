"use strict";

var fs = require('fs-extra')
  , path = require('path');

module.exports = exports = function(opts) {

  var cwd = opts.cwd;

  return function(req, res, next) {
    var themeId = res.locals.store.themeId;
    var file = themeId
      ? path.join(cwd, 'themes', themeId, 'assets.json')
      : path.join(cwd, 'assets.json');
    fs.readJsonFile(file, 'utf-8', function(err, obj) {
      res.locals.assets = obj || {};
      next();
    });
  };

};
