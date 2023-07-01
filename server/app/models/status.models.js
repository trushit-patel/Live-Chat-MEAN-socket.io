const mongoose = require('mongoose');

const userStatusSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  online: {
    type: Boolean,
    default: false,
  },
});

const UserStatus = mongoose.model('UserStatus', userStatusSchema);

module.exports = UserStatus;
