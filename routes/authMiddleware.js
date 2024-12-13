const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, 'seceret_key', (err, decodedToken) => {
            if (err) {
                console.log("Token verification failed:", err);
                res.locals.user = null; 
                return res.redirect('/login'); 
            } else {
                req.user = decodedToken;
                next(); 
            }
        });
    } else {
        res.locals.user = null;
        return res.redirect('/login');
    }
};

module.exports = authMiddleware;

