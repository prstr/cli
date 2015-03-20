'use strict';

var Client = require('../client')()
  , done = require('../done');

module.exports = exports = function(opts) {
  Client.getJSON('admin/test', {}, function(err, res) {
    if (err) return done(err);
    console.log(res.body);
  });
};
