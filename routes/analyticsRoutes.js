const express = require('express');
const router = express.Router();
const { 
    getOverview, 
    getTrends, 
    getAIInsights 
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/overview', authorize('admin', 'teacher'), getOverview);
router.get('/trends', getTrends);
router.get('/ai-insights', getAIInsights);

module.exports = router;
