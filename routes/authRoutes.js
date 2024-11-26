const express = require('express');
const authController = require('../controllers/authController.js');
const router = express.Router();

// Views
router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {  // Generic register route, could redirect based on user type or have separate links on this page
    res.render('register', { userType: null }); // userType determines form action 
});


router.get('/register-student', (req, res) => { // Route for student registration form
    res.render('register', { userType: 'student' }); // Pass user type to the view
});

router.get('/register-admin', (req, res) => { // Route for admin registration form
    res.render('register', { userType: 'admin' }); // Pass user type to the view
});



// Controller actions
router.post('/login', authController.login);
router.post('/register-student', authController.register); // Route for student registration
router.post('/register-admin', authController.register); // Route for admin registration
router.get('/logout', authController.logout);

module.exports = router;

