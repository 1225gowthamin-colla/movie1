const Student = require('../models/Student');
const AttendanceLog = require('../models/AttendanceLog');

// @desc    Get system overview stats
// @route   GET /api/analytics/overview
// @access  Private (Admin/Teacher)
exports.getOverview = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const students = await Student.find();
        
        const avgAttendance = students.length > 0 
            ? (students.reduce((acc, s) => acc + s.attendancePercentage, 0) / students.length).toFixed(2)
            : 0;

        const atRiskStudents = students.filter(s => s.attendancePercentage < 75).length;

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                avgAttendance: parseFloat(avgAttendance),
                atRiskStudents,
                totalClassesHeld: students.length > 0 ? Math.max(...students.map(s => s.totalClasses)) : 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get daily attendance trends (last 7 days)
// @route   GET /api/analytics/trends
// @access  Private
exports.getTrends = async (req, res) => {
    try {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }

        const trends = await Promise.all(last7Days.map(async (date) => {
            const count = await AttendanceLog.countDocuments({ date });
            return { date, count };
        }));

        res.status(200).json({ success: true, data: trends });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get AI-powered insights & predictions
// @route   GET /api/analytics/ai-insights
// @access  Private
exports.getAIInsights = async (req, res) => {
    try {
        const students = await Student.find().populate('user', 'name');
        
        const insights = students.map(student => {
            let prediction = "Stable";
            let recommendation = "Maintain current regularity.";
            let riskLevel = "Low";

            // Simple Pattern Recognition (Mock AI Logic)
            if (student.attendancePercentage < 75) {
                prediction = "At Risk of Failure";
                recommendation = "Immediate counselor meeting required.";
                riskLevel = "High";
            } else if (student.attendancePercentage < 85) {
                prediction = "Declining Trend";
                recommendation = "Improve attendance to stay above 75% threshold.";
                riskLevel = "Medium";
            }

            return {
                studentId: student.studentId,
                name: student.user.name,
                currentPercentage: student.attendancePercentage.toFixed(2),
                prediction,
                riskLevel,
                recommendation
            };
        });

        // Filter for significant insights (Top 5 risks)
        const priorityInsights = insights
            .filter(i => i.riskLevel !== "Low")
            .sort((a, b) => a.currentPercentage - b.currentPercentage)
            .slice(0, 5);

        res.status(200).json({
            success: true,
            summary: `${priorityInsights.length} students require attention.`,
            data: priorityInsights
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
