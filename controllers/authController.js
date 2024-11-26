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

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const StudentRecord = require('../models/studentRecord');
const AttendanceManager = require('../models/attendanceManager.js'); // Require both models
require('dotenv').config();


exports.login = async (req, res) => {
    const {email, password} = req.body;

    try {
        // Look for student first, then fallback to staff
        let user = await StudentRecord.findOne({ email });
        if (!user) {
            user = await AttendanceManager.findOne({ email });
        }


        if(!user) {
            return res.status(400).send('Invalid credentials');
        }

        const result = await bcrypt.compare(password, user.password);

        if(!result) {
            return res.status(401).send('Invalid credentials');
        }

        const token = jwt.sign({ id: user._id.toString(), role: user.role }, 'seceret_key'); 
        res.cookie('jwt', token, { maxAge: 5 * 60 * 1000, httpOnly: true, secure: true}); // Secure flag added


        const redirectPath = user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard';
        res.redirect(redirectPath);


    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send('Internal Server Error'); // Corrected status code
    }
}


exports.register = async (req, res) => {
    const{email, password, confirmPassword} = req.body;
    try {
        const existingUser = await AttendanceManager.findOne({email});
        if(existingUser) {
            return res.status(400).send('User already exists');
        }
        if(password !== confirmPassword) {
            return res.status(400).send('Passwords do not match');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new AttendanceManager({
            email,
            password: hashedPassword,
        });
        await newUser.save();
        
    res.redirect('/login');
    } catch (error) {
        res.send(500).send('Internal Server Error');
    }
}

exports.logout = (req, res) => {
    // Clear the JWT token by setting the cookie to be expired immediately
    res.clearCookie('jwt', { httpOnly: true, secure: true });
    res.redirect('/login');
};
