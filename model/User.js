const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    password : {
        type: String,
        required: true,
        max: 2000,
        min: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordCode: Number,
    resetPasswordExpDate: Date,

});

module.exports = mongoose.model('User', userSchema);