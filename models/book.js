const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    ISBN: { type: String, required: true },
    name: { type: String, required: true },
    author: { type: String, required: true },
    status: { type: String, enum: ['in progress', 'completed', 'unread'], default: 'unread' },
    isadded: { type: String, default: '0' }
});

module.exports = mongoose.model('Book', bookSchema);