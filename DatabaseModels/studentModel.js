const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
    matriculationNumber: {
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

const studentModel = mongoose.model('students', studentSchema);

module.exports = studentModel;
