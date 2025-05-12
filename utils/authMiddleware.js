const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');

module.exports = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    throw new AuthenticationError('Authorization header missing');
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    throw new AuthenticationError('Invalid token format. Use: Bearer <token>');
  }

  const token = tokenParts[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { user: decoded };
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    throw new AuthenticationError(
      err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
    );
  }
};