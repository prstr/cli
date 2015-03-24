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
  client.getJSON('admin/storage/files', {}, function(err, res) {
    if (err) return done(err);
    var serverFiles = res.body
      , clientFiles = []
      , cRemoved = 0
      , cSkipped = 0
      , cFailed = 0
      , cSuccess = 0
      , queries = [];

    if (remove) {
      queries.push(function(cb) {
        glob(process.cwd() + '/+(templates|static)/**/*.*', function(err, files) {
          /* istanbul ignore if */
          if (err) return cb(err);
          var serverFilenames = _(serverFiles).map(function(file) {
            return file.filename;
          });
          var clientFilenames = _(files).map(function(file) {
            return file.replace(process.cwd(), '');
          });
          async.each(serverFilenames, function(filename, cb) {
            /* istanbul ignore if */
            if (clientFilenames.indexOf(filename) > -1) return cb();
            cRemoved += 1;
            client.request('delete', '/admin/storage/file' + filename)({}, cb)
          }, cb)
        })
      });
    }

    queries.push(function(cb) {
      async.each(clientFiles, function(clientFile, cb) {
        var serverFile = _(serverFiles).findWhere({ filename: clientFile.filename});
        var skip = !force && serverFile && serverFile.mtime && clientFile.mtime < serverFile.mtime ;
        if (skip) {
          cSkipped += 1;
          return cb();
        }
        var filePath = path.join(process.cwd(), clientFile.filename);
        var request = client.request('post', '/admin/storage/file' + clientFile.filename);
        var r = request({}, function(err, res, body) {
          /* istanbul ignore if */
          if (err) return cb(err);
          if (res.statusCode != 200) {
            // Report failure and skip
            console.error('%s %s %s',
              colors.red('✘'),
              clientFile.filename,
              colors.blackBright(res.statusCode));
            cFailed += 1;
            return cb();
          }
          console.log('%s %s', colors.green('✔'), clientFile.filename);
          cSuccess += 1;
          cb();
        });
        var form = r.form();
        form.append('file', fs.createReadStream(filePath));
      }, cb)
    });

    var g = new glob.Glob(process.cwd() + '/+(templates|static)/**/*.*',
      { stat: true });

    g.on('stat', function(filename, stat) {
      clientFiles.push({
        filename: filename.replace(process.cwd(), ''),
        mtime: stat.mtime.getTime()
      })
    });

    g.on('end', function() {
      async.parallel(queries, function(err) {
        /* istanbul ignore if */
        if (err) return done(err);
        console.log('Pull done:');
        console.log('\t%s file(s) pushed', colors.green(cSuccess));
        console.log('\t%s file(s) removed', colors.blackBright(cRemoved));
        console.log('\t%s errors', colors.red(cFailed));
        console.log('\t%s file(s) skipped', colors.blackBright(cSkipped));
        done();
      });
    });
  });
};

