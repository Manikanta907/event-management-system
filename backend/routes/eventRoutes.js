const express = require('express');
const router = express.Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getStats } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getStats);
router.route('/').get(getEvents).post(createEvent);
router.route('/:id').get(getEvent).put(updateEvent).delete(deleteEvent);

module.exports = router;
