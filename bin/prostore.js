#!/usr/bin/env node
'use strict';

var nomnom = require('nomnom');

nomnom.command('init')
  .callback(function(opts) {
    require('../lib/cmd/init')
  })
  .help('Initialize the store directory.');

nomnom.command('test')
  .help('Test.')
  .callback(require('../lib/cmd/test'));

nomnom.command('pull')
  .option('force', {
    flag: true,
    help: 'Force pull'
  })
  .option('remove', {
    flag: true,
    help: 'Remove files if they are not at server.'
  })
  .callback(require('../lib/cmd/pull'))
  .help('Pull.');


nomnom.parse();
