const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getMessages, markRead, getGroupMessages } = require('../controllers/messageController');

router.get('/group/:groupId', protect, getGroupMessages);
router.get('/:userId', protect, getMessages);
router.post('/:userId/read', protect, markRead);

module.exports = router;
