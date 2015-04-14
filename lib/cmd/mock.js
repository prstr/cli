"use strict";

var http = require('http');

module.exports = exports = function(opts) {

  var app = require('../mock/app')(opts);

  http.createServer(app).listen(opts.port, function() {
    console.log('Type http://localhost:3000 to access mock store.');
    console.log('Hit Ctrl+C to stop mock server.');
  });

};
