const { DataTypes } = require('sequelize');
const dbConnection = require('../db')

// TODO: Workshop Part 2: add one key per field below, each set to a DataTypes type
// (and allowNull/defaultValue where noted). id is created automatically.
//   title          STRING   required
//   author         STRING   required
//   genre          STRING
//   publishedYear  INTEGER
//   available      BOOLEAN  defaults to true
const Book = dbConnection.define('book', {
title: {
      type: Book.STRING,
      allowNull: false    },
    author: {
      type: Book.STRING,
      allowNull: false
    },
    genre: {
        type: Book.STRING
    }, 
    publishedYear: {
        type: Book.INTEGER    
    },
    available: {
        type: Book.BOOLEAN,
        defaultValue: true    
}})

module.exports = Book