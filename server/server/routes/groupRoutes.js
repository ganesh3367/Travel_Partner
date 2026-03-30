const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { createGroup, getGroups, joinGroup, getGroupDetails, requestJoinGroup, respondJoinGroup } = require('../controllers/groupController');

router.get('/', protect, getGroups);
router.post('/', protect, createGroup);
router.post('/:id/join', protect, joinGroup);
router.get('/:id', protect, getGroupDetails);
router.post('/:id/request-join', protect, requestJoinGroup);
router.post('/:id/respond-join', protect, respondJoinGroup);

module.exports = router;
