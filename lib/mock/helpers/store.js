"use strict";

var _ = require('underscore')
  , path = require('path')
  , Nano = require('nanotemplates')
  , Compiler = Nano.Compiler
  , FallbackLoader = Nano.FallbackLoader
  , FileLoader = Nano.FileLoader;

var Store = module.exports = exports = function(options, cwd) {
  if (!(this instanceof Store))
    return new Store(options, cwd);
  this.cwd = cwd;
  _.extend(this, options);
};

Object.defineProperty(Store.prototype, 'compiler', {
  get: function() {
    var store = this;
    if (!store._compiler) {
      var loaders = [
        new FileLoader(path.join(store.cwd, 'templates'))
      ];
      if (store.themeId)
        loaders.push(new FileLoader(
          path.join(store.cwd, 'themes', store.themeId, 'templates')));
      console.log(loaders);
      store._compiler = new Compiler({
        load: new FallbackLoader(loaders)
      });
    }
    return store._compiler;
  }
});

Store.prototype.compile = function(file, cb) {
  this.compiler.compile(file, cb);
};
