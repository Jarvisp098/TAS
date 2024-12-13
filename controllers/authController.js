const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const StudentRecord = require('../models/studentRecord');
const AttendanceManager = require('../models/attendanceManager.js');
require('dotenv').config();

exports.login = async (req, res) => {
    const { email, password, studentId } = req.body;
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
            redirectPath = 'student-dashboard';  
            userIdForJWT = user._id.toString();
        }

        const userName = user.name || user.email;  

        const token = jwt.sign({ id: userIdForJWT, role: user.role, selectedCourses: user.selectedCourses }, 'seceret_key');
        res.cookie('jwt', token, { maxAge: 5 * 60 * 1000, httpOnly: true, secure: true }); 

        const successMessage = `Login successful! Welcome, ${userName}.`;
       
        res.render(redirectPath, { user, studentName: userName, studentEmail: user.email });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send('Internal Server Error'); 
    }
};

exports.register = async (req, res) => {
    const { name, email, password, confirmPassword } = req.dy;
    const selectedCourses = req.body.course || []; 

   
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
            selectedCourses: selectedCourses 
        });
        await newStudent.save();
        console.log("New Student Registered:", newStudent); 
        res.redirect('/login');

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).send('Internal Server Error');
    }
};

exports.logout = (req, res) => {
    res.clearCookie('jwt', { httpOnly: true, secure: true });
    res.redirect('/login');
};