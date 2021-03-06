'use strict';

var fs = require('fs-extra')
  , async = require('async')
  , path = require('path');

module.exports = exports = function (opts) {

  var cwd = opts.cwd;

  return function (req, res, next) {
    fs.readdir(path.join(cwd, 'mock'), function (ignoredErr, files) {
      files = (files || []).filter(function (file) {
        return /\.json$/.test(file);
      });
      async.each(files, function (file, cb) {
        fs.readJson(path.join(cwd, 'mock', file), 'utf-8',
          function (ignoredErr, obj) {
            var name = path.basename(file, path.extname(file));
            res.locals[name] = obj || {};
            res.templateData[name] = res.locals[name];
            cb();
          });
      }, next);
    });
  };

};
