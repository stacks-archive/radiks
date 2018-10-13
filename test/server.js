const express = require('express');
const { setup } = require('radiks-server');

const app = express();

app.use('/radiks', setup({
  databaseName: 'radiks-testing',
  databaseUrl: 'http://localhost:5984',
  adminUser: process.env.COUCHDB_ADMIN,
  adminPassword: process.env.COUCHDB_PASSWORD,
}));

module.exports = app;
