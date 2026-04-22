const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Register a new student (for Admin/Teacher)
// @route   POST /api/students
// @access  Private (Admin/Teacher)
exports.createStudent = async (req, res) => {
    try {
        const { userId, studentId, course, department } = req.body;

        // Check if student profile already exists for this user
        const existingStudent = await Student.findOne({ user: userId });
        if (existingStudent) {
            return res.status(400).json({ success: false, message: 'Student profile already exists for this user' });
        }

        const student = await Student.create({
            user: userId,
            studentId,
            course,
            department
        });

        res.status(201).json({ success: true, data: student });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all students with user details
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('user', 'name email');
        res.status(200).json({ success: true, count: students.length, data: students });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('user', 'name email');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({ success: true, data: student });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update student stats or info
// @route   PUT /api/students/:id
// @access  Private
exports.updateStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: student });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
