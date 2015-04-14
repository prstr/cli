#!/usr/bin/env node
'use strict';

var nomnom = require('nomnom');

nomnom.command('login')
  .help('Obtain authentication tokens for ProStore')
  .option('url', {
    position: 1,
    help: 'Store URL (e.g. https://example.store)'
  })
  .option('verbose', {
    abbr: 'v',
    help: 'Print debug messages',
    flag: true
  })
  .option('cwd', {
    help: 'Current work directory',
    default: process.cwd()
  })
  .callback(require('../lib/cmd/login'));

nomnom.command('status')
  .option('verbose', {
    abbr: 'v',
    help: 'Print debug messages',
    flag: true
  })
  .option('cwd', {
    help: 'Current work directory',
    default: process.cwd()
  })
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
  .option('verbose', {
    abbr: 'v',
    help: 'Print debug messages',
    flag: true
  })
  .option('theme', {
    help: 'Download theme files instead'
  })
  .option('cwd', {
    help: 'Current work directory',
    default: process.cwd()
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
  .option('verbose', {
    abbr: 'v',
    help: 'Print debug messages',
    flag: true
  })
  .option('cwd', {
    help: 'Current work directory',
    default: process.cwd()
  })
  .callback(require('../lib/cmd/push'))
  .help('Upload store files to server');

nomnom.command('mock')
  .option('port', {
    abbr: 'p',
    help: 'Port to listen on',
    default: 3000
  })
  .option('cwd', {
    help: 'Current work directory',
    default: process.cwd()
  })
  .callback(require('../lib/cmd/mock'))
  .help('Start mock server for local development');

nomnom.parse();
