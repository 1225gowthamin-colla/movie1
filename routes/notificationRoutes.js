const express = require('express');
const router = express.Router();
const { 
    getNotifications, 
    markRead 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.put('/:id', markRead);

module.exports = router;
