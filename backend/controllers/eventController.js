const Event = require('../models/Event');
const Guest = require('../models/Guest');

// @desc    Get all events for logged-in organizer
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const query = { organizer: req.user._id };

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('guestCount')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: events,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('guestCount');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this event' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    res.status(201).json({ success: true, data: event, message: 'Event created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: updated, message: 'Event updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await Guest.deleteMany({ event: req.params.id });
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event and all associated guests deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get event analytics / dashboard stats
// @route   GET /api/events/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const organizerId = req.user._id;

    const [
      totalEvents,
      upcomingEvents,
      completedEvents,
      guestStats
    ] = await Promise.all([
      Event.countDocuments({ organizer: organizerId }),
      Event.countDocuments({ organizer: organizerId, date: { $gte: new Date() }, status: { $nin: ['cancelled', 'completed'] } }),
      Event.countDocuments({ organizer: organizerId, status: 'completed' }),
      Guest.aggregate([
        {
          $lookup: {
            from: 'events',
            localField: 'event',
            foreignField: '_id',
            as: 'eventData'
          }
        },
        { $unwind: '$eventData' },
        { $match: { 'eventData.organizer': organizerId } },
        {
          $group: {
            _id: '$rsvpStatus',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const rsvpMap = { pending: 0, yes: 0, no: 0, maybe: 0 };
    guestStats.forEach(s => { rsvpMap[s._id] = s.count; });
    const totalGuests = Object.values(rsvpMap).reduce((a, b) => a + b, 0);

    // Recent events
    const recentEvents = await Event.find({ organizer: organizerId })
      .populate('guestCount')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        events: { total: totalEvents, upcoming: upcomingEvents, completed: completedEvents },
        guests: { total: totalGuests, confirmed: rsvpMap.yes, declined: rsvpMap.no, pending: rsvpMap.pending, maybe: rsvpMap.maybe },
        recentEvents
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getStats };
