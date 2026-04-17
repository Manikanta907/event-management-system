const Guest = require('../models/Guest');
const Event = require('../models/Event');

// @desc    Get guests for an event (with RSVP filter)
// @route   GET /api/guests?event=:eventId&rsvpStatus=yes&search=john
// @access  Private
const getGuests = async (req, res) => {
  try {
    const { event, rsvpStatus, search, checkedIn, page = 1, limit = 50 } = req.query;
    const query = {};

    if (event) query.event = event;
    if (rsvpStatus) query.rsvpStatus = rsvpStatus;
    if (checkedIn !== undefined) query.checkedIn = checkedIn === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [guests, total] = await Promise.all([
      Guest.find(query)
        .populate('event', 'title date venue')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Guest.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: guests,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single guest
// @route   GET /api/guests/:id
// @access  Private
const getGuest = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id).populate('event', 'title date venue');
    if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });
    res.json({ success: true, data: guest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add guest to event
// @route   POST /api/guests
// @access  Private
const addGuest = async (req, res) => {
  try {
    const { event: eventId } = req.body;

    // Verify event belongs to organizer
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const guest = await Guest.create(req.body);
    const populated = await guest.populate('event', 'title date venue');
    res.status(201).json({ success: true, data: populated, message: 'Guest added successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This email is already registered for this event' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update guest / RSVP status
// @route   PUT /api/guests/:id
// @access  Private
const updateGuest = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('event', 'title date venue');
    if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });
    res.json({ success: true, data: guest, message: 'Guest updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete guest
// @route   DELETE /api/guests/:id
// @access  Private
const deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id);
    if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });
    res.json({ success: true, message: 'Guest removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle check-in status
// @route   PATCH /api/guests/:id/checkin
// @access  Private
const toggleCheckIn = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });

    guest.checkedIn = !guest.checkedIn;
    guest.checkedInAt = guest.checkedIn ? new Date() : undefined;
    await guest.save();

    res.json({ success: true, data: guest, message: guest.checkedIn ? 'Guest checked in' : 'Check-in reversed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get RSVP stats for an event
// @route   GET /api/guests/stats/:eventId
// @access  Private
const getEventGuestStats = async (req, res) => {
  try {
    const stats = await Guest.aggregate([
      { $match: { event: require('mongoose').Types.ObjectId.createFromHexString(req.params.eventId) } },
      { $group: { _id: '$rsvpStatus', count: { $sum: 1 } } }
    ]);

    const result = { total: 0, pending: 0, yes: 0, no: 0, maybe: 0, checkedIn: 0 };
    stats.forEach(s => {
      result[s._id] = s.count;
      result.total += s.count;
    });

    const checkedIn = await Guest.countDocuments({ event: req.params.eventId, checkedIn: true });
    result.checkedIn = checkedIn;

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getGuests, getGuest, addGuest, updateGuest, deleteGuest, toggleCheckIn, getEventGuestStats };
