const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userBranchId = decoded.branchId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireBranchAdmin(req, res, next) {
  if (req.userRole !== 'branch_admin') {
    return res.status(403).json({ error: 'Branch admin access required' });
  }
  next();
}

module.exports = { requireAuth, requireBranchAdmin };