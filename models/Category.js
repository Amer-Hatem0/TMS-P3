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
}, { timestamps: true });

// Add pre-save hook to prevent null/empty names
categorySchema.pre('save', function(next) {
  if (!this.name || this.name.trim() === '') {
    throw new Error('Category name is required');
  }
  this.name = this.name.trim();
  next();
});

// Add case-insensitive unique index to prevent case-duplicates
// categorySchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

module.exports = mongoose.model('Category', categorySchema);