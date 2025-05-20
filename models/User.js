const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
  type: String, 
  enum: {
    values: ['student', 'admin'],
    message: 'Role must be either "student" or "admin"'
  }, 
  required: true 
},
  universityId: {
    type: String,
    required: function () {
      return this.role === 'student';
    }
  }
});

// Add case-insensitive index for username and trim whitespace
userSchema.index({ username: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
userSchema.pre('save', function(next) {
  this.username = this.username.trim();
  next();
});

module.exports = mongoose.model('User', userSchema);
