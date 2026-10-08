const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (!allowedRoles.includes(req.user.role)) {
    res.status(403);
    throw new Error('Forbidden: insufficient role permissions');
  }

  next();
};

module.exports = { authorizeRoles };
