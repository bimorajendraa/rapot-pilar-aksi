const jwt = require('jsonwebtoken');

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not set. Refusing to sign/verify tokens without a real secret.');
    }
    return secret;
}

function signToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        dept_id: user.dept_id ?? null,
        dept_name: user.dept_name ?? null,
    };
    return jwt.sign(payload, getJwtSecret(), {
        expiresIn: process.env.JWT_EXPIRES_IN || '12h',
    });
}

function verifyToken(token) {
    return jwt.verify(token, getJwtSecret());
}

// Express middleware: reads `Authorization: Bearer <token>`, sets req.user.
function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    try {
        req.user = verifyToken(token);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// EB = super admin (bypasses department filters). Everyone else is scoped
// to their own department via dept_name.
function getUserScope(user) {
    const isAdmin = user.role === 'EB';
    return {
        isAdmin,
        deptName: isAdmin ? null : user.dept_name,
    };
}

function canAccessMember(user, memberDeptName) {
    const { isAdmin, deptName } = getUserScope(user);
    if (isAdmin) return true;
    return !!deptName && deptName === memberDeptName;
}

module.exports = {
    signToken,
    verifyToken,
    requireAuth,
    getUserScope,
    canAccessMember,
};
