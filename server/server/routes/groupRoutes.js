const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { createGroup, getGroups, joinGroup, getGroupDetails } = require('../controllers/groupController');

router.get('/', protect, getGroups);
router.post('/', protect, createGroup);
router.post('/:id/join', protect, joinGroup);
router.get('/:id', protect, getGroupDetails);

module.exports = router;
