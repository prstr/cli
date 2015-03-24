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
  client.get('admin/storage', function(err, remoteFiles) {
    if (err) return done(err);
    var cRemoved = 0
      , cSkipped = 0
      , cFailed = 0
      , cSuccess = 0
      , queries = [];
    var cwd = path.resolve(process.cwd(), 'store');
    var localFiles = glob.sync('**/*', {
      cwd: cwd,
      nodir: true
    });
    if (remove)
      remoteFiles.forEach(function(f) {
        var removing = localFiles.every(function(file) {
          return f.filename != file
        });
        if (removing)
          queries.push(function(cb) {
            client.request('delete', '/admin/storage/' + f.filename)({}, function(err) {
              /* istanbul ignore if */
              if (err) return cb(err);
              console.log('%s %s', colors.red('D'), f.filename);
              cRemoved += 1;
              cb();
            });
          });
      });
    localFiles.forEach(function(file) {
      if (!force)
        try {
          var serverFile = _(remoteFiles).findWhere({ filename: file });
          var stat = fs.statSync(path.resolve(cwd, file));
          var skip = serverFile && serverFile.mtime &&
            stat.mtime.getTime() < serverFile.mtime ;
          if (skip) {
            cSkipped += 1;
            return;
          }
        } catch (e) {}
      queries.push(function(cb) {
        var request = client.request('post', '/admin/storage/' + file);
        var r = request({}, function(err, res, body) {
          /* istanbul ignore if */
          if (err) return cb(err);
          if (res.statusCode != 200) {
            // Report failure and skip
            console.error('%s %s %s',
              colors.red('✘'),
              file,
              colors.blackBright(res.statusCode));
            cFailed += 1;
            return cb();
          }
          console.log('%s %s', colors.green('✔'), file);
          cSuccess += 1;
          cb();
        });
        var form = r.form();
        form.append('file', fs.createReadStream(path.resolve(cwd, file)));
      });
    });
    async.series(queries, function(err) {
      /* istanbul ignore if */
      if (err) return done(err);
      console.log('Push done:');
      console.log('\t%s pushed', colors.green(cSuccess));
      console.log('\t%s deleted', colors.red(cRemoved));
      console.log('\t%s skipped', colors.blackBright(cSkipped));
      if (cFailed)
        console.log('\t%s failed', colors.red(cFailed));
      done();
    });
  });
};

