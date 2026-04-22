const AttendanceLog = require('../models/AttendanceLog');
const Student = require('../models/Student');

// Helper: Haversine distance in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

// @desc    Mark attendance with geofencing
// @route   POST /api/attendance/mark
// @access  Private (Student)
exports.markAttendance = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const student = await Student.findOne({ user: req.user.id });

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        // 1. Geofencing Validation
        const instLat = parseFloat(process.env.INSTITUTION_LAT);
        const instLng = parseFloat(process.env.INSTITUTION_LNG);
        const radius = parseInt(process.env.GEOFENCE_RADIUS);

        const distance = calculateDistance(lat, lng, instLat, instLng);

        if (distance > radius) {
            return res.status(400).json({ 
                success: false, 
                message: `Out of range. You are ${Math.round(distance)}m away from campus.` 
            });
        }

        // 2. Time Window Validation (Example: 9 AM to 10 AM)
        const now = new Date();
        const hour = now.getHours();
        // For production, this should be dynamic or configurable
        // if (hour < 9 || hour >= 10) {
        //     return res.status(400).json({ success: false, message: 'Attendance window is closed (9:00 - 10:00 AM only)' });
        // }

        // 3. Prevent duplicate for the day
        const today = now.toISOString().split('T')[0];
        const existingLog = await AttendanceLog.findOne({ student: student._id, date: today });
        if (existingLog) {
            return res.status(400).json({ success: false, message: 'Attendance already marked for today' });
        }

        // 4. Create log
        const log = await AttendanceLog.create({
            student: student._id,
            date: today,
            location: { lat, lng },
            distanceFromCenter: Math.round(distance)
        });

        // 5. Update Student Stats
        student.presentCount += 1;
        student.totalClasses += 1;
        student.attendancePercentage = (student.presentCount / student.totalClasses) * 100;
        student.lastMarkedTime = now;
        await student.save();

        // 6. Real-time notification (via Socket.io)
        req.io.emit('attendanceUpdate', {
            studentName: req.user.name,
            timestamp: now,
            status: 'Present'
        });

        res.status(201).json({ success: true, data: log });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get attendance history
// @route   GET /api/attendance/history
// @access  Private
exports.getHistory = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) {
            const logs = await AttendanceLog.find().populate('student');
            return res.status(200).json({ success: true, count: logs.length, data: logs });
        }

        const logs = await AttendanceLog.find({ student: student._id }).sort('-timestamp');
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
