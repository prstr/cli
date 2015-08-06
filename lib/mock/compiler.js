'use strict';

var Nano = require('nanotemplates')
  , Compiler = Nano.Compiler
  , fileLoader = Nano.fileLoader
  , fallbackLoader = Nano.fallbackLoader
  , path = require('path');

module.exports = exports = function (opts) {

  var cwd = opts.cwd;

  return function (req, res, next) {
    var loaders = [
      fileLoader(path.join(cwd, 'templates'))
    ];
    // Optinally fallback to theme, if themeId exists in store.json
    var themeId = res.locals.store.themeId;
    if (themeId)
      loaders.push(fileLoader(
        path.join(cwd, 'themes', themeId, 'templates')));
    res.locals.compiler = new Compiler({
      load: fallbackLoader(loaders)
    });
    next();
  };

};
