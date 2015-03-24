'use strict';

var done = require('../done')
  , Client = require('../client');

module.exports = exports = function(opts) {
  var client = Client();
  client.getJSON('admin/test', {}, function(err, res) {
    if (err) return done(err);
    console.log(res.body);
  });
};
