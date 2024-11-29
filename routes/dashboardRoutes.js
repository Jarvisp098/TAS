// dashboardRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const authMiddleware = require('./authMiddleware'); // Path to your middleware
const moment = require('moment');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const dashboardController = require('../controllers/dashboardController');
const enrollmentCountsRoutes = require('./studentCount');

//Database Connection (Move this to db.js and require that here)
mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Define your schema (Move this to a models folder in a file like lectureAttendance.js and require the same here)
const LectureAttendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 'User' should be your User model
    joinTime: { type: Date, required: true }
});

const LectureAttendance = mongoose.model('LectureAttendance', LectureAttendanceSchema);


// router.get('/admin-dashboard', authMiddleware, (req, res) => {
//     console.log(req.user);
//     if (!req.user) { // Check if the user object exists in the request
//         return res.redirect('/login'); // Redirect to login if not authenticated
//     }

//     if (req.user.role !== 'admin'){
//         return res.redirect('/student-dashboard'); // Redirect if not an admin
//     }

//     res.render('admin-dashboard');
// });

// router.get('/student-dashboard', authMiddleware, (req, res) => {
//     console.log(req.user);
//     if (!req.user) {
//         return res.redirect('/login');
//     }


//     if (req.user.role !== 'student'){
//         return res.redirect('/admin-dashboard'); // Redirect if not a student
//     }
//     res.render('student-dashboard');
// });

router.get('/admin-dashboard', authMiddleware, (req, res) => {  // Middleware applied
    if (!res.locals.user) {       // Check for authenticated user HERE!
      return res.redirect('/login');
    }
  
    if (res.locals.user.role !== 'admin') {  // Check role AFTER authentication
      return res.redirect('/student-dashboard');
    }
  
    // ... render admin dashboard; user is now guaranteed to be an admin
    res.render('admin-dashboard', {user: res.locals.user});
  
  });
  
  
router.get('/student-dashboard', authMiddleware, (req, res) => { // Middleware applied
    if (!res.locals.user) {    // Check for authenticated user HERE!
      return res.redirect('/login');
    }
  
      if (res.locals.user.role !== 'student') { // Check role AFTER authentication
        return res.redirect('/admin-dashboard');
      }
  
      res.render('student-dashboard', {user: res.locals.user}); // Render student dashboard
  
  });
  

router.post('/joinLecture', authMiddleware, async (req, res) => { // Make the handler async
    const joinTimeFromClient = req.body.joinTime;

    // 1. Validate:
    if (!joinTimeFromClient) {
        return res.status(400).json({ error: "Invalid Join Time" });
    }

    // 2. Store in Database (using Mongoose)
    try {
        const userId = req.user.id; // Corrected: Get userId from req.user
        const attendance = new LectureAttendance({ userId: userId, joinTime: joinTimeFromClient }); // Use your model
        await attendance.save(); // Save to MongoDB

        // 3. Respond to the client
        res.status(200).json({ message: 'Join successful', joinTime: joinTimeFromClient });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: 'Database error' });  // Send error to client
    }

});

// dashboardRoutes.js
router.post('/selectCourse1', authMiddleware, dashboardController.selectCourse1);
router.post('/selectCourse2', authMiddleware, dashboardController.selectCourse2);


module.exports = router;
