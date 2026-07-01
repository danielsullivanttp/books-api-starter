const bookModel = require('./book');
const review = require('./review');

bookModel.hasMany(review);

review.belongsTo(bookModel);

module.exports = {
    bookModel, 
    review
}