const passport = require('passport');

const authenticateWithCustomError = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            console.error('Error during JWT authentication:', err);
            return res.status(500).json({
                message: "Internal Server Error",
                nextAction: '/login'
            });
        }
        if (!user) {
            // Check if the token is expired or invalid
            if (info && info.name === 'TokenExpiredError') {
                return res.status(401).json({
                    message: "Session expired. Please log in again.",
                    nextAction: '/login'
                });
            }
            return res.status(401).json({
                message: "Invalid email or password.",
                nextAction: '/login'
            });
        }
        req.user = user; // Attach user object to request
        next();
    })(req, res, next);
};

module.exports = authenticateWithCustomError;
