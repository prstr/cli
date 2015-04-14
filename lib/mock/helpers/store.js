"use strict";

var _ = require('underscore');

var Store = module.exports = exports = function(options) {
  if (!(this instanceof Store))
    return new Store(options);
  _.extend(this, options);
};
