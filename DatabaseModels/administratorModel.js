const mongoose = require('mongoose');

const administratorSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 20
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const administratorModel = mongoose.model('administrators', administratorSchema);

module.exports = administratorModel;
