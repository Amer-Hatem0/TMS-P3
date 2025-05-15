const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');

module.exports = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new AuthenticationError('Authorization required');
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { user: decoded };
  } catch (err) {
    throw new AuthenticationError('Invalid/Expired token');
  }
};