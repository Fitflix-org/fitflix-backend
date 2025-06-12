const jwt = require('jsonwebtoken');

const authorizeFrontdesk = (req, res, next) => {
  console.log('Frontdesk authorization middleware triggered');

  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).send('Unauthorized: No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded; // Attach decoded user information to the request

    const user = req.user;

    if (!user) {
      return res.status(401).send('Unauthorized: No user information found.');
    }

    // Check if the user has the 'frontdesk' role
    if (user.role !== 'frontdesk') {
      return res.status(403).send('Access Denied: Only frontdesk managers can access this resource.');
    }

    // For gym-specific resources, check if the frontdesk manager is assigned to that gym.
    // This assumes that gym_id is part of the route parameters or request body for gym-related operations.
    const requestedGymId = req.params.gymId || req.body.gymId;

    if (requestedGymId && user.gymId && user.gymId !== requestedGymId) {
      return res.status(403).send('Access Denied: Not authorized for this gym.');
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(401).send('Unauthorized: Invalid token.');
  }
};

module.exports = { authorizeFrontdesk };