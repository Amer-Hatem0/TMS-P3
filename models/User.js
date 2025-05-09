const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], required: true },
  universityId: {
    type: String,
    required: function () {
      return this.role === 'student';
    }
  }
});

module.exports = mongoose.model('User', userSchema);
