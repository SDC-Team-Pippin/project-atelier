const Sequelize = require('sequelize');
require('dotenv').config();

const db = new Sequelize(process.env.dbName, process.env.dbUsername, process.env.dbPassword, {
  host: process.env.dbHost,
  dialect: 'postgres',
  logging: false,
});

db.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = db;
