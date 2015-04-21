#!/usr/bin/env node
'use strict';

var nomnom = require('nomnom');

nomnom.command('login')
  .help('Получить аутентификацию из ProStore')
  .option('url', {
    position: 1,
    help: 'URL магазина (пр. https://example.store)'
  })
  .option('cwd', {
    help: 'Рабочая директория',
    default: process.cwd()
  })
  .callback(require('../lib/cmd/login'));

nomnom.command('status')
  .help('Показать отличия локальной версии от версии на сервере')
  .option('cwd', {
    help: 'Рабочая директория',
    default: process.cwd()
  })
  .callback(require('../lib/cmd/status'));

nomnom.command('pull')
  .help('Скачать файлы с сервера')
  .option('force', {
    flag: true,
    help: 'Не использовать кэш'
  })
  .option('remove', {
    flag: true,
    help: 'Удалить файлы локально, если их больше нет на сервере'
  })
  .option('theme', {
    help: 'Скачать обновление указанной темы'
  })
  .option('cwd', {
    help: 'Рабочая директория',
    default: process.cwd()
  })
  .callback(require('../lib/cmd/pull'));

nomnom.command('push')
  .help('Загрузить файлы на сервер')
  .option('force', {
    flag: true,
    help: 'Не использовать кэш'
  })
  .option('remove', {
    flag: true,
    help: 'Удалить файлы с сервера, которых больше нет локально'
  })
  .option('cwd', {
    help: 'Рабочая директория',
    default: process.cwd()
  })
  .callback(require('../lib/cmd/push'));

nomnom.command('mock')
  .option('port', {
    abbr: 'p',
    help: 'Port to listen on',
    default: 3000
  })
  .option('cwd', {
    help: 'Рабочая директория',
    default: process.cwd()
  })
  .callback(require('../lib/cmd/mock'))
  .help('Запустить мокап для локальной разработки');

nomnom.parse();
