const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    course: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    attendancePercentage: {
        type: Number,
        default: 0
    },
    totalClasses: {
        type: Number,
        default: 0
    },
    presentCount: {
        type: Number,
        default: 0
    },
    lastMarkedTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
