"use strict";

var spawn = require('child_process').spawn
  , which = require('which')
  , colors = require('colors')
  , done = require('./done');

/**
 * Returns `true` if git repo located in `cwd` is dirty (contains uncommitted
 * changes).
 * Returns error if git exits with non-zero status code (e.g. when no git repo
 * found in `cwd`).
 *
 * @param cwd - current work directory
 * @param cb - callback function
 */
exports.isDirty = function(cwd, cb) {
  which('git', function(err, git) {
    /* istanbul ignore if */
    if (err) return cb(err);
    var p = spawn(git, ['status', '--short'], {
      cwd: cwd
    });
    var output = ''
      , error = '';
    p.stdout.on('data', function(data) {
      output += data.toString('utf-8');
    });
    p.stderr.on('data', function(data) {
      error += data.toString('utf-8');
    });
    p.on('close', function(code) {
      if (code == 128)
        return cb(new Error('GIT_NOT_INITIALIZED'));
      if (code > 0)
        return cb(new Error(stderr));
      return cb(null, output.trim() != '');
    });
  });

};

/**
 * Executes `fn` only when git repo in `options.cwd` is clean.
 *
 * If `options.nogit` is specified, execute `fn` regardless, but print a warning.
 */
exports.runInCleanGit = function(options, fn) {
  var cwd = options.cwd;
  if (options.nogit) {
    console.log('--nogit: %s', colors.yellow('Надеемся, Вы знаете, что делаете.\n'));
    return fn();
  }
  exports.isDirty(cwd, function(err, dirty) {
    var abort = false;
    if (err) {
      abort = true;
      if (err.message == 'GIT_NOT_INITIALIZED') {
        console.log('----------------------');
        console.log(colors.red('Вы не используете Git!'));
        console.log('----------------------\n');
        console.log('Настоятельно рекомендуем Вам использовать Git, чтобы не потерять свою работу.\n');
      } else {
        console.error(colors.red(err.message));
      }
    }
    if (dirty) {
      abort = true;
      console.log('--------------------------');
      console.log(colors.yellow('Грязная рабочая директория'));
      console.log('--------------------------\n');
      console.log('Перед работой с сервером необходимо скоммитить изменения в Git, чтобы не потерять свою работу.\n');
    }
    if (abort) {
      console.log('Используйте %s, чтобы выполнить команду принудительно.\n',
        colors.yellow('--nogit'));
      done();
    }
    fn();
  });
};
