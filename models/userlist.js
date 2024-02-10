const mongoose = require('mongoose');

const userListSchema = new mongoose.Schema({
    ISBN: { type: String, required: true },
    name: { type: String, required: true },
    author: { type: String, required: true },
    status: { type: String, enum: ['in progress', 'completed', 'unread'], default: 'unread' }
});

module.exports = mongoose.model('userList', userListSchema);