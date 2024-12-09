const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const StudentRecord = require('../models/studentRecord');
const AttendanceManager = require('../models/attendanceManager.js'); // Require both models
require('dotenv').config();

exports.login = async (req, res) => {
    const { email, password, studentId } = req.body; // Include studentId in the request body
    try {
        let user;
        let redirectPath;
        let userIdForJWT;

        // Check if the user is an admin
        user = await AttendanceManager.findOne({ email });
        if (user) {
            // User is an admin
            const result = await bcrypt.compare(password, user.password);
            if (!result) {
                return res.status(401).send('Invalid admin credentials');
            }
            redirectPath = 'admin-dashboard';
            userIdForJWT = user._id.toString();
        } else {
            // User is a student
            if (studentId) {
                // Check for student login using studentId
                user = await StudentRecord.findOne({ studentId });
            } else {
                // Check for student login using email
                user = await StudentRecord.findOne({ email });
            }

            if (!user) {
                return res.status(400).send('Invalid credentials');
            }

            const result = await bcrypt.compare(password, user.password);
            if (!result) {
                return res.status(401).send('Invalid credentials');
            }
            redirectPath = 'student-dashboard';  // No .ejs extension
            userIdForJWT = user._id.toString();
        }

        const userName = user.name || user.email;  // For the view

        // Include selectedCourses in the JWT payload
        const token = jwt.sign({ id: userIdForJWT, role: user.role, selectedCourses: user.selectedCourses }, 'seceret_key');
        res.cookie('jwt', token, { maxAge: 5 * 60 * 1000, httpOnly: true, secure: true }); // Secure for HTTPS

        // Render the appropriate dashboard with user data and success message
        const successMessage = `Login successful! Welcome, ${userName}.`;
        // Render the appropriate dashboard with user data
        res.render(redirectPath, { user, studentName: userName, studentEmail: user.email });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send('Internal Server Error'); // Corrected status code
    }
};

exports.register = async (req, res) => {
    const { name, email, password, confirmPassword } = req.dy;
    const selectedCourses = req.body.course || []; // Capture selected courses as an array

    // Log the selected courses for debugging
    console.log("Selected Courses:", selectedCourses);

    try {
        const existingStudent = await StudentRecord.findOne({ email });
        if (existingStudent) {
            return res.status(400).send('Student already exists!');
        }

        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match!');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newStudent = new StudentRecord({
            name,
            email,
            password: hashedPassword,
            role: 'student',
            selectedCourses: selectedCourses // Store selected courses
        });
        await newStudent.save();
        console.log("New Student Registered:", newStudent); // Log the new student object
        res.redirect('/login');

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).send('Internal Server Error');
    }
};

exports.logout = (req, res) => {
    res.clearCookie('jwt', { httpOnly: true, secure: true }); // Secure for HTTPS
    res.redirect('/login');
};