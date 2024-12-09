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
        const { name, email, password, confirmPassword, selectedCourses } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match!');
        }

        const existingStudent = await StudentRecord.findOne({ email });
        if (existingStudent) {
            return res.status(400).send('Student already exists!');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Fetch the last studentId from the database
        const lastStudent = await StudentRecord.findOne().sort({ studentId: -1 }).exec();
        let lastStudentId = lastStudent ? parseInt(lastStudent.studentId.replace('TAS', '')) : 0; // Extract the numeric part and convert to integer

        // Generate the new studentId
        const newStudentId = `TAS${String(lastStudentId + 1).padStart(2, '0')}`; // Increment and format

        const newStudent = new StudentRecord({
            studentId: newStudentId, // Assign the generated student ID
            name,
            email,
            password: hashedPassword,
            role: 'student',
            selectedCourses: selectedCourses || [] // Store selected courses
        });

        await newStudent.save();
        res.redirect('/login');

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