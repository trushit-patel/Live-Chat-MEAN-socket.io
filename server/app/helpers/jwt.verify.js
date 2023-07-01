const jwt = require('jsonwebtoken');
const jwtConfig = require('../../config/jwt.config');

exports.auth = (req, res, next)=> {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded; // add the user information to the request object
    next();
  } catch (ex) {
    res.status(400).send('Invalid token provided.');
  }
}