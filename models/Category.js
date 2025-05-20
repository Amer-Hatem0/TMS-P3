const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Category name cannot be empty'
    }
  }
}, {
  timestamps: true
});

// Add text index for case-insensitive search
categorySchema.index({ name: 'text' });

module.exports = mongoose.model('Category', categorySchema);