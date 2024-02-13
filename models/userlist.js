const mongoose = require('mongoose');

const userListSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    status: { type: String, enum: ['in progress', 'completed', 'unread'], default: 'unread' }
});

module.exports = mongoose.model('userList', userListSchema);