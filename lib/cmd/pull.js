'use strict';

var Client = require('../client')
  , async = require('async')
  , done = require('../done')
  , fs = require('fs-extra')
  , colors = require('cli-color')
  , path = require('path')
  , glob = require('glob')
  , _ = require('underscore');

module.exports = exports = function(opts) {
  var client = Client()
    , force = opts.force
    , remove = opts.remove;
  client.get('admin/storage', {}, function(err, files) {
    if (err) return done(err);
    var cRemoved = 0
      , cSkipped = 0
      , cFailed = 0
      , cSuccess = 0
      , queries = [];
    var cwd = path.resolve(process.cwd(), 'store');
    var existingFiles = glob.sync('**/*', {
      cwd: cwd,
      nodir: true
    });
    if (remove)
      existingFiles.forEach(function(file) {
        var removing = files.every(function(f) {
          return f.filename != file
        });
        if (removing)
          queries.push(function(cb) {
            fs.remove(path.resolve(cwd, file), function(err) {
              /* istanbul ignore if */
              if (err) return cb(err);
              console.log('%s %s', colors.red('D'), file);
              cRemoved += 1;
              cb();
            });
          });
      });
    files.forEach(function(file) {
      var filePath = path.join(cwd, file.filename);
      if (!force)
        try {
          var stat = fs.statSync(filePath);
          var skip = stat.mtime.getTime() > file.mtime;
          if (skip) {
            cSkipped += 1;
            return;
          }
        } catch(e) {}
      queries.push(function(cb) {
        var request = client.request('get', '/admin/storage/' + file.filename);
        request({ encoding: null, json: false }, function(err, res, body) {
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
          fs.outputFile(filePath, body, 'utf-8', function(err) {
            if (err) return cb(err);
            console.log('%s %s', colors.green('✔'), file.filename);
            cSuccess += 1;
            cb();
          });
        });
      });
    });
    async.series(queries, function(err) {
      /* istanbul ignore if */
      if (err) return done(err);
      console.log('Pull done:');
      console.log('\t%s pulled', colors.green(cSuccess));
      console.log('\t%s deleted', colors.red(cRemoved));
      console.log('\t%s skipped', colors.blackBright(cSkipped));
      if (cFailed)
        console.log('\t%s failed', colors.red(cFailed));
      done();
    });
  });
};

