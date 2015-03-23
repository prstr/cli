#!/usr/bin/env node
'use strict';

var nomnom = require('nomnom');

nomnom.command('init')
  .help('Initialize the store directory.')
  .callback(require('../lib/cmd/init'));

nomnom.command('test')
  .help('Test.')
  .callback(require('../lib/cmd/test'));

nomnom.command('pull')
  .help('Pull.')
  .callback(require('../lib/cmd/pull'));


nomnom.parse();
