const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { 
  type: String, 
  required: true,
  trim: true,
  minLength: [3, 'Title must be at least 3 characters']
},
  description: { type: String },
  status: { 
  type: String, 
  enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED','ON_HOLD','CANCELLED'],
  default: 'PENDING'
},
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  dueDate: {
  type: Date,
  validate: {
    validator: function(v) {
      return !v || v >= new Date();
    },
    message: 'Due date must be in the future'
  }
}
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);