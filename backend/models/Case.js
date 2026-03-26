const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caseName: {
    type: String,
    required: [true, 'Please add a case name']
  },
  type: {
    type: String,
    enum: ['Legal', 'Financial'],
    required: [true, 'Please specify case type']
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Case = mongoose.model('Case', caseSchema);
module.exports = Case;
