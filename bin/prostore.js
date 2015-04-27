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
    help: 'Скачать все файлы (локальные изменения могут быть утеряны)'
  })
  .option('remove', {
    flag: true,
    help: 'Удалить файлы, если их нет на сервере (локальные изменения могут быть утеряны)'
  })
  .option('theme', {
    help: 'Скачать обновление указанной темы'
  })
  .option('nogit', {
    flag: true,
    help: 'Не проверять статус Git-репозитория (не рекомендуется)'
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
    help: 'Загрузить все файлы (изменения на сервере могут быть утеряны)'
  })
  .option('remove', {
    flag: true,
    help: 'Удалить файлы с сервера, которых нет локально (изменения на сервере могут быть утеряны)'
  })
  .option('nogit', {
    flag: true,
    help: 'Не проверять статус Git-репозитория (не рекомендуется)'
  })
  .option('cwd', {
    help: 'Рабочая директория',
    default: process.cwd()
  })
  .callback(require('../lib/cmd/push'));

nomnom.command('mock')
  .option('port', {
    abbr: 'p',
    help: 'Порт',
    default: 3000
  })
  .option('cwd', {
    help: 'Рабочая директория',
    default: process.cwd()
  })
  .callback(require('../lib/cmd/mock'))
  .help('Запустить мокап для локальной разработки');

nomnom.parse();
