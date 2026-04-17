const express = require('express');
const router = express.Router();
const { getGuests, getGuest, addGuest, updateGuest, deleteGuest, toggleCheckIn, getEventGuestStats } = require('../controllers/guestController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats/:eventId', getEventGuestStats);
router.route('/').get(getGuests).post(addGuest);
router.route('/:id').get(getGuest).put(updateGuest).delete(deleteGuest);
router.patch('/:id/checkin', toggleCheckIn);

module.exports = router;
