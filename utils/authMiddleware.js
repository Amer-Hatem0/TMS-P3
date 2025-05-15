const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');

module.exports = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new AuthenticationError('Token required');
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return { user: decoded }; 
    } catch (err) {
      throw new AuthenticationError(
        err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
      );
    }
  };