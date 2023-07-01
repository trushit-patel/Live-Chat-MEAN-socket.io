const UserStatus = require('../models/status.models');
const userService = require('./user.service');
const mongoose = require('mongoose');
// Service method to update the online status of a user

exports.createUserStatus = async (user) => {
  try {
    return await UserStatus.create({ user, online: false });
  } catch (error) {
    console.error('Error creating user status:', error);
    throw new Error('Failed to create user status');
  }
};

exports.updateUserStatus = async (user, onlineStatus) => {
  try {
    return await UserStatus.findOneAndUpdate(
      { user },
      { online: onlineStatus },
      { new: true, upsert: true }
    ).populate({
      path: 'user',
      select: '-hash',
    });

  } catch (error) {
    throw new Error('Error updating user online status');
  }
}

exports.getUserStatus = async () => {
  try {
    return await UserStatus.find().populate({
      path: 'user',
      select: '-hash',
    });

  } catch (error) {
    throw new Error('Failed to fetch user status data');
  }
}

exports.getUserStatusExceptMe = async (user) => {
  try {

    user = await userService.getByUsername(user.username);
    return await UserStatus.find({ user: { $ne: mongoose.Types.ObjectId(user._id) } }).populate({
      path: 'user',
      select: '-hash',
      });

  } catch (error) {
    throw new Error('Failed to fetch user status data');
  }
}
