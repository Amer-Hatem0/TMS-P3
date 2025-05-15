const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED','ON_HOLD','CANCELLED'], 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  dueDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);