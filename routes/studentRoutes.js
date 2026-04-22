const express = require('express');
const router = express.Router();
const { 
    createStudent, 
    getStudents, 
    getStudent, 
    updateStudent 
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All routes are protected

router.route('/')
    .get(getStudents)
    .post(authorize('admin', 'teacher'), createStudent);

router.route('/:id')
    .get(getStudent)
    .put(authorize('admin', 'teacher'), updateStudent);

module.exports = router;
