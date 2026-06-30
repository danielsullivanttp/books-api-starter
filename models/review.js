const {DataTypes} =  require('sequelize');
const dbConnector = require ('../db');

const Review = dbConnector.define('review' ,{
    reviewer: {
       type: DataTypes.STRING,
       allowNull: false     
    },
    rating: {
        type: DataTypes.INTEGER,
       allowNull: false
    },
    comment: {
        type: DataTypes.TEXT
    }

})

module.exports = Review;