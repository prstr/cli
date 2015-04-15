"use strict";

var Nano = require('nanotemplates')
  , Compiler = Nano.Compiler
  , FileLoader = Nano.FileLoader
  , FallbackLoader = Nano.FallbackLoader
  , path = require('path');

module.exports = exports = function(opts) {

  var cwd = opts.cwd;

  return function(req, res, next) {
    var loaders = [
      new FileLoader(path.join(cwd, 'templates'))
    ];
    // Optinally fallback to theme, if themeId exists in store.json
    var themeId = res.locals.store.themeId;
    if (themeId)
      loaders.push(new FileLoader(
        path.join(cwd, 'themes', themeId, 'templates')));
    res.locals.compiler = new Compiler({
      load: new FallbackLoader(loaders)
    });
    next();
  };

};
