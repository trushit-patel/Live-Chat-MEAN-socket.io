const userService = require('../services/status.service');

// Controller method to fetch user status data
exports.getUserStatus = async (req, res)=>{
  try {
    const userStatusData = await userService.getUserStatus();
    res.status(200).json(userStatusData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user status data' });
  }
}

exports.getUserStatusExceptMe = async (req, res)=>{
  try {
    const userStatusData = await userService.getUserStatusExceptMe(req.user);
    res.status(200).json(userStatusData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user status data' });
  }
}