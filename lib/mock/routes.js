'use strict';

var express = require('express');

var router = module.exports = exports = new express.Router();

router.get('/login', function (req, res) {
  res.render('login.html');
});

router.get('/product', function (req, res) {
  var product = res.locals.product;
  if (!product)
    return res.send('Создайте файл data/product.json, чтобы смакетировать страницу продукта.');
  res.render('product/view.html');
});

router.get('/product/:id', function (req, res) {
  var id = 'product.' + req.params.id;
  var product = res.locals[id];
  if (!product)
    return res.send('Создайте файл data/' + id + '.json, чтобы смакетировать страницу продукта.');
  res.render('product/view.html', {
    product: product
  });
});

