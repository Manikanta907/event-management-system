const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true,
    maxlength: [80, 'Name cannot exceed 80 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address']
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  rsvpStatus: {
    type: String,
    enum: ['pending', 'yes', 'no', 'maybe'],
    default: 'pending'
  },
  rsvpDate: {
    type: Date
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  plusOne: {
    type: Boolean,
    default: false
  },
  dietaryRestrictions: {
    type: String,
    default: '',
    maxlength: [200, 'Dietary restrictions cannot exceed 200 characters']
  },
  notes: {
    type: String,
    default: '',
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: {
    type: Date
  },
  inviteSent: {
    type: Boolean,
    default: false
  },
  tableNumber: {
    type: Number
  }
}, { timestamps: true });

// Compound unique index: one email per event
guestSchema.index({ email: 1, event: 1 }, { unique: true });

// Update rsvpDate when status changes
guestSchema.pre('save', function(next) {
  if (this.isModified('rsvpStatus') && this.rsvpStatus !== 'pending') {
    this.rsvpDate = new Date();
  }
  next();
});

module.exports = mongoose.model('Guest', guestSchema);
