/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} roles - Permitted roles (e.g. 'administrator', 'faculty', 'student', 'club_coordinator')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to perform this action. Required: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = { authorize };
