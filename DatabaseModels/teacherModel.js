const mongoose = require('mongoose');

const teacherSchema = mongoose.Schema({
    staffNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 10
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    password: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const teacherModel = mongoose.model('teachers', teacherSchema);

module.exports = teacherModel;
