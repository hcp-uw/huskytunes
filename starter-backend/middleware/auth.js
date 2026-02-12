// Authentication middleware to check if user is logged in
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({ error: 'Unauthorized - Please log in' });
  }
};

module.exports = { requireAuth };
