// const express = require('express');
// const authController = require('../controllers/authController.js');
// const bcrypt = require('bcrypt'); // Make sure bcrypt is required here
// const StudentRecord = require('../models/studentRecord'); //require here for the StudentRecord schema
// const router = express.Router();

// // Views
// router.get('/login', (req, res) => {
//     res.render('login');
// });

// router.get('/register', (req, res) => {  // Generic register route, could redirect based on user type or have separate links on this page
//     res.render('register', { userType: null }); // userType determines form action 
// });


// router.get('/register-student', (req, res) => { // Route for student registration form
//     res.render('register', { userType: 'student' }); // Pass user type to the view
// });

// router.get('/register-admin', (req, res) => { // Route for admin registration form
//     res.render('register', { userType: 'admin' }); // Pass user type to the view
// });



// // Controller actions
// router.post('/login', authController.login);
// router.post('/register-student', authController.register); // Route for student registration
// router.post('/register-admin', authController.register); // Route for admin registration
// router.get('/logout', authController.logout);

// module.exports = router;

const express = require('express');
const authController = require('../controllers/authController.js');
const bcrypt = require('bcrypt');
const StudentRecord = require('../models/studentRecord');
const AttendanceManager = require('../models/attendanceManager'); // Require your admin model
const router = express.Router();

// Views (No changes needed here)
router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register', { userType: null });
});

router.get('/register-student', (req, res) => {
    res.render('register', { userType: 'student' });
});

router.get('/register-admin', (req, res) => {
    res.render('register', { userType: 'admin' });
});

// Controller actions (login and logout remain unchanged)
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Student Registration Route
router.post('/register-student', async (req, res) => {
    try {
        const { name, email, password, confirmPassword, course } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match!');
        }

        const existingStudent = await StudentRecord.findOne({ email });
        if (existingStudent) {
            return res.status(400).send('Student already exists!');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newStudent = new StudentRecord({
            name,
            email,
            password: hashedPassword,
            role: 'student', // Explicitly set the role
            course: course    // Store selected course
        });

        await newStudent.save();
        res.redirect('/login'); // Or another success redirect

    } catch (error) {
        console.error("Student Registration Error:", error);
        res.status(500).send('Internal Server Error');
    }
});


// Admin Registration Route (Example - adapt to your needs)
router.post('/register-admin', async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body; // Adjust fields as needed

        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match!');
        }


        const existingAdmin = await AttendanceManager.findOne({ email }); // Use your Admin model
        if (existingAdmin) {
            return res.status(400).send('Admin already exists!');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new AttendanceManager({  // Use your Admin model
            email,
            password: hashedPassword,
            role: 'admin'  // Or whatever role designation you use
            // ... any other admin fields ...
        });
        await newAdmin.save();
        res.redirect('/login'); // Or another admin success redirect


    } catch (error) {
        console.error("Admin Registration Error:", error);
        res.status(500).send('Internal Server Error');
    }
});




module.exports = router;

