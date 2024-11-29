// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const StudentRecord = require('../models/studentRecord');
// //const AttendanceManager = require('../models/attendanceManager.js');
// require('dotenv').config();


// exports.login = async (req, res) => {
//     const {email, password} = req.body;

//     try {
//         const user = await AttendanceManager.findOne({email});

//         if(!user) {
//             return res.status(400).send('Invalid credentials');
//         }

//         const result = await bcrypt.compare(password, user.password);

//         if(!result) {
//             return res.status(401).send('Invalid credentials');
//         }

//         //generate the jwt
//         //temp disable const token = jwt.sign({id: user._id.toString()}, 'seceret_key', {expiresIn: '5m'});
//         const token = jwt.sign({ id: user._id.toString(), role: user.role }, 'seceret_key'); // Include role here
//         res.cookie('jwt', token, { maxAge: 5 * 60 * 1000, httpOnly: true}); // Added httpOnly and secure flags (recommended)


//         if (user.role === 'admin') {
//             res.redirect('/admin-dashboard');
//         } else {
//             res.redirect('/student-dashboard');
//         }
//         // //create cokkie and place JWT/token inside it
//         // res.cookie('jwt', token, { maxAge: 5 * 60 * 1000, http: true});

//         // res.redirect('/dashboard');

//     } catch (error) {
//         console.error("Login Error:", error);
//         res.send(500).send('Internal Server Error');
//     }
// }

// authController.js
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const StudentRecord = require('../models/studentRecord');
// const AttendanceManager = require('../models/attendanceManager.js'); // Require both models
// require('dotenv').config();


// exports.login = async (req, res) => {
//     const {email, password} = req.body;

//     try {
//         // Look for student first, then fallback to staff
//         let user = await StudentRecord.findOne({ email });
//         if (!user) {
//             user = await AttendanceManager.findOne({ email });
//         }

//         if(!user) {
//             return res.status(400).send('Invalid credentials'); // Correct status code for bad request
//         }

//         const result = await bcrypt.compare(password, user.password);

//         if(!result) {
//             return res.status(401).send('Invalid credentials'); // Correct status code for unauthorized
//         }

//         const token = jwt.sign({ id: user._id.toString(), role: user.role }, 'seceret_key'); 
//         res.cookie('jwt', token, { maxAge: 5 * 60 * 1000, httpOnly: true, secure: true }); // Secure flag added


//         // Fetch the user's name based on their model
//         let userName = null;
//         if (user instanceof StudentRecord) {
//           userName = user.name;
//         } else if (user instanceof AttendanceManager) {
//             userName = user.email; // Or whatever name field you have for AttendanceManager
//         }


//         const redirectPath = user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard';
//         res.render(redirectPath, { user, studentName: userName }); // Pass name and user object


//     } catch (error) {
//         console.error("Login Error:", error);
//         res.status(500).send('Internal Server Error'); // Corrected status code
//     }
// };

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const StudentRecord = require('../models/studentRecord');
const AttendanceManager = require('../models/attendanceManager.js');
require('dotenv').config();

const adminEmail = 'admin@admin.com'; // Replace with your admin email
const adminPasswordHash = '$2b$10$HRQUEe.vE1DtB9YMWrzsqefW2/fOW0NHVtj2zS6bot4VAwts7IMZm'; // Hashed admin password

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user;
        let redirectPath;
        let userIdForJWT;

        if (email === adminEmail) {
            user = { email: adminEmail, role: 'admin' };
            const result = await bcrypt.compare(password, adminPasswordHash);
            if (!result) {
                return res.status(401).send('Invalid admin credentials');
            }
            redirectPath = 'admin-dashboard'; // No .ejs extension
            userIdForJWT = 'admin'; // Or a suitable admin identifier

        } else {
            user = await StudentRecord.findOne({ email });
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
        const token = jwt.sign({ id: userIdForJWT, role: user.role }, 'seceret_key');
        res.cookie('jwt', token, { maxAge: 5 * 60 * 1000, httpOnly: true, secure: true }); // Secure for HTTPS

         res.render(redirectPath, { user, studentName: userName, studentEmail: user.email });
        

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send('Internal Server Error');
    }
};


exports.register = async (req, res) => {
    const { name, email, password, confirmPassword, role } = req.body;
    try {
        const existingStudent = await StudentRecord.findOne({ email });
        if (existingStudent) {
            return res.status(400).send('Student already exists!');
        }

        const existingAdmin = await AttendanceManager.findOne({ email });
        if (existingAdmin) {
            return res.status(400).send('Admin already exists!');
        }

        if (role === 'student') {
            if (password !== confirmPassword) {
                return res.status(400).send('Passwords do not match!');
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newStudent = new StudentRecord({ name, email, password: hashedPassword, role: 'student' });
            await newStudent.save();
            res.redirect('/login');

        } else if (role === 'admin') {
            if (password !== confirmPassword) {
                return res.status(400).send('Passwords do not match');
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new AttendanceManager({ email, password: hashedPassword, role: 'admin' });
            await newUser.save();
            res.redirect('/login');
        }

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).send('Internal Server Error');
    }
};


exports.logout = (req, res) => {
    res.clearCookie('jwt', { httpOnly: true, secure: true }); // Secure for HTTPS
    res.redirect('/login');
};

