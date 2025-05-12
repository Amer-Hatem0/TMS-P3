const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    required: true 
  },
  status: { 
    type: String, 
    enum: ['IN_PROGRESS', 'COMPLETED', 'PENDING', 'ON_HOLD', 'CANCELLED'],
    default: 'PENDING'
  },
  startDate: { type: Date },
  endDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  progress: { type: Number, default: 0, min: 0, max: 100 } // Added for student updates
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);