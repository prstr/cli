'use strict';

var http = require('http');

module.exports = exports = function(opts) {

  var app = require('../mock/app')(opts);

  http.createServer(app).listen(opts.port, function() {
    console.log('Зайдите на http://localhost:3000 для доступа к макету магазина');
    console.log('Нажмите Ctrl+C, чтобы остановить сервер.');
  });

};
