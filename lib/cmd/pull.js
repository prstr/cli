'use strict';

var Client = require('../client')()
  , async = require('async')
  , done = require('../done')
  , fs = require('fs-extra')
  , colors = require('cli-color')
  , path = require('path');

module.exports = exports = function(opts) {

  Client.getJSON('cli/pull', {}, function(err, res) {
    if (err) return done(err);
    var files = res.body
      , cSkipped = 0
      , cFailed = 0
      , cSuccess = 0;

    async.each(files, function(file, cb) {
      fs.stat(path.join(process.cwd(), file.filename), function(err, stat) {
        var skip = stat && file.mtime && stat.mtime.getTime() > file.mtime;
        if (skip) {
          cSkipped += 1;
          return cb();
        }
        var request = Client.request('get', '/cli/pull' + file.filename);
        request({ encoding: null }, function(err, res, body) {
          /* istanbul ignore if */
          if (err) return cb(err);
          if (res.statusCode != 200) {
            // Report failure and skip
            console.error('%s %s %s',
              colors.red('✘'),
              file.filename,
              colors.blackBright(res.statusCode));
            cFailed += 1;
            return cb();
          }
          fs.outputFile(path.join(process.cwd(), file.filename), body, function(err) {
            if (err) return cb(err);
            console.log('%s %s', colors.green('✔'), file.filename);
            cSuccess += 1;
            cb();
          });
        });
      });
    }, function(err) {
      /* istanbul ignore if */
      if (err) return done(err);
      console.log('Pull done:');
      console.log('\t%s file(s) pulled', colors.green(cSuccess));
      console.log('\t%s errors', colors.red(cFailed));
      console.log('\t%s files skipped', colors.blackBright(cSkipped));
      done();
    });

  });
};

