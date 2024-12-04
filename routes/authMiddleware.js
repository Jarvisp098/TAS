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

// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//     const token = req.cookies.jwt;

//     if (token) {
//         jwt.verify(token, 'seceret_key', (err, decodedToken) => {
//             if (err) {
//                 console.log("Token verification failed:", err) // Log the error for debugging
//                 res.locals.user = null;  // Set user to null in locals, so that the view can adjust
//                 next();  // Don't redirect; just let the route handle unauthorized access
//             } else {
//                 req.user = decodedToken;
//                 next();
//             }
//         });
//     } else {
//         res.locals.user = null;
//         next(); // Move to the next middleware/route handler
//     }
// };

// module.exports = authMiddleware;

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.jwt; // Get the token from cookies

    if (token) {
        jwt.verify(token, 'seceret_key', (err, decodedToken) => {
            if (err) {
                console.log("Token verification failed:", err);
                res.locals.user = null; // Set user to null in locals
                return res.redirect('/login'); // Redirect to login if token is invalid
            } else {
                req.user = decodedToken; // Attach decoded token to request
                next(); // Proceed to the next middleware or route handler
            }
        });
    } else {
        res.locals.user = null; // No token found
        return res.redirect('/login'); // Redirect to login if no token
    }
};

module.exports = authMiddleware;

