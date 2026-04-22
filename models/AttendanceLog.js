const mongoose = require('mongoose');

const attendanceLogSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    location: {
        lat: Number,
        lng: Number
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late'],
        default: 'present'
    },
    verified: {
        type: Boolean,
        default: true
    },
    distanceFromCenter: {
        type: Number // in meters
    }
}, { timestamps: true });

// Ensure unique attendance per student per day
attendanceLogSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceLog', attendanceLogSchema);
