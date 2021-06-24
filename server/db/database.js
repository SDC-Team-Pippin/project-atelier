const Sequelize = require('sequelize');
require('dotenv').config();

const dbName = 'atelier_qa';
const db = new Sequelize(dbName, process.env.dbusername, process.env.dbpassword, {
  host: 'localhost',
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
