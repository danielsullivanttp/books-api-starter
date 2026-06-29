const { Sequelize } = require("sequelize");

const db = new Sequelize("postgres://postgres:root@localhost:5432/books_api", {
  logging: false,
});

module.exports = db;
// TODO: Workshop Part 1: create a new Sequelize instance pointed at your
// books_api database, then export it. Same postgres:// connection string