'use strict';

var crypto = require('crypto')
  , fs = require('fs-extra')
  , _ = require('underscore');

exports.sha256 = function(str) {
  var p = crypto.createHash('sha256');
  p.update(str, 'utf-8');
  return p.digest('hex');
};

exports.randomString = function(length) {
  var CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890_';
  var result = '';
  for (var i = 0; i < length; i++)
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  return result;
};

exports.compileFile = function(src, dst, data, cb) {
  fs.readFile(src, 'utf-8', function(err, text) {
    if (err) return cb(err);
    var compiled = _.template(text)(data);
    fs.writeFile(dst, compiled, 'utf-8', cb);
  });
};