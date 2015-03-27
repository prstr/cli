#!/usr/bin/env node
'use strict';

var nomnom = require('nomnom');

nomnom.command('test')
  .help('Test API keypair authentication')
  .callback(require('../lib/cmd/test'));

nomnom.command('login')
  .help('Login')
  .callback(require('../lib/cmd/login'));

nomnom.command('status')
  .callback(require('../lib/cmd/status'))
  .help('Show what\'s modified on server vs. locally');

nomnom.command('pull')
  .option('force', {
    flag: true,
    help: 'Ignore last modified cache'
  })
  .option('remove', {
    flag: true,
    help: 'Remove files not present on server'
  })
  .callback(require('../lib/cmd/pull'))
  .help('Download store files from server');

nomnom.command('push')
  .option('force', {
    flag: true,
    help: 'Ignore last modified cache'
  })
  .option('remove', {
    flag: true,
    help: 'Remove files not present locally'
  })
  .callback(require('../lib/cmd/push'))
  .help('Upload store files to server');

nomnom.parse();
