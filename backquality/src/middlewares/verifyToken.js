const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['x-token'];
    if (!token) {
        return res.status(403).json({ message: 'Token requerido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to the request
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = verifyToken;