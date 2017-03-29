'use strict';

const bodyParser = require('body-parser'),
      express = require('express');

const routes = require('./routes');

const getApp = function(external) {
  const app = express();

  app.use(bodyParser.json());
  app.get('/recipes',  routes.getRecipes(external));

  return app;
};

module.exports = getApp;
