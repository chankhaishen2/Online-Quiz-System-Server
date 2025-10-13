const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    choiceA: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    choiceB: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    choiceC: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    choiceD: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    correctAnswer: {
        type: String,
        required: true,
        validate: {
            validator: function(correctAnswer) {
                return (correctAnswer === 'A' || correctAnswer === 'B' || correctAnswer === 'C' || correctAnswer === 'D');
            }
        }
    },
    explanation: {
        type: String,
        trim: true,
        maxlength: 3000
    },
    diagramFileName: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    editedAt: {
        type: Date,
        default: Date.now
    }
});

const participantSchema = mongoose.Schema({
    matriculationNumber: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    }
});

const answerSchema = mongoose.Schema({
    questionId: {
        type: String,
        required: true
    },
    choice: {
        type: String,
        required: true,
        validate: {
            validator: function(choice) {
                return (choice === 'A' || choice === 'B' || choice === 'C' || choice === 'D');
            }
        }
    }
});

const scriptSchema = mongoose.Schema({
    matriculationNumber: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    answers: [answerSchema],
    startedAt: {
        type: Date,
        default: Date.now
    },
    lastAnsweredAt: {
        type: Date
    },
    mark: {
        type: Number,
        default: 0,
        min: 0
    }
});

const quizSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 100
    },
    status: {
        type: String,
        required: true,
        default: 'Not published',
        validate: {
            validator: function(status) {
                return (status === 'Not published' || status === 'Published' || status === 'Result released');
            }
        }
    },
    questions: [questionSchema],
    participants: [participantSchema],
    scripts: [scriptSchema],
    teacherStaffNumber: {
        type: String,
        required: true,
        trim: true
    },
    teacherName: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    editedAt: {
        type: Date,
        default: Date.now
    },
    maximumDurationInMinutes: {
        type: Number,
        min: 1,
        max: 180
    },
    expiredAfter: {
        type: Date
    }
});

const quizModel = mongoose.model('quizzes', quizSchema);

module.exports = quizModel;
