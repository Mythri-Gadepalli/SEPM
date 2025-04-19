import jwt from 'jsonwebtoken';

// authMiddleware function
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization'); // Extract token from the Authorization header
  
  // If there's no token in the request, return an error
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token using JWT_SECRET from environment variables
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.userId = decoded.userId;  // Attach userId from the decoded token to the request object
    next();  // Call the next middleware or route handler
  } catch (err) {
    // If the token is invalid or expired, return an error
    res.status(401).json({ error: 'Invalid token' });
  }
};

export default authMiddleware;
