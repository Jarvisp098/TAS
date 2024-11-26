// // routes/authMiddleware.js
// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//     const token = req.cookies.jwt;

//     if (token) {
//         jwt.verify(token, 'seceret_key', (err, decodedToken) => {  // ensure this secret key matches the one in authController.js
//             if (err) {
//                 return res.redirect('/login');
//             } else {
//                 req.user = decodedToken;
//                 next();
//             }
//         });
//     } else {
//         return res.redirect('/login');
//     }
// };

// module.exports = authMiddleware;

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, 'seceret_key', (err, decodedToken) => {
            if (err) {
                console.log("Token verification failed:", err) // Log the error for debugging
                res.locals.user = null;  // Set user to null in locals, so that the view can adjust
                next();  // Don't redirect; just let the route handle unauthorized access
            } else {
                req.user = decodedToken;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next(); // Move to the next middleware/route handler
    }
};

module.exports = authMiddleware;

