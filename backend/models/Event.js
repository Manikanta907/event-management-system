const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema({
  time: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  duration: { type: Number, default: 30 } // in minutes
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  endDate: {
    type: Date
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['conference', 'workshop', 'seminar', 'wedding', 'birthday', 'corporate', 'concert', 'sports', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'published'
  },
  capacity: {
    type: Number,
    default: 100,
    min: [1, 'Capacity must be at least 1']
  },
  coverImage: {
    type: String,
    default: ''
  },
  tags: [{ type: String, trim: true }],
  schedule: [scheduleItemSchema],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Virtual: guest count
eventSchema.virtual('guestCount', {
  ref: 'Guest',
  localField: '_id',
  foreignField: 'event',
  count: true
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
