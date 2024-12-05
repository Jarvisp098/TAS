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
const LectureAttendance = require('../models/lectureAttendance');

//Database Connection (Move this to db.js and require that here)
mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

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
  
      res.render('student-dashboard', {user: res.locals.user, course: null}); // Render student dashboard
  
  });
  

  router.post('/joinLecture', authMiddleware, async (req, res) => { // Make the handler async
    const { course, joinTime } = req.body; // Get course and joinTime from the request body

    // Validate
    if (!joinTime) {
        return res.status(400).json({ error: "Invalid Join Time" });
    }

    // Store in Database
    try {
        const userId = req.user.id; // Get userId from req.user
        const attendance = new LectureAttendance({ userId: userId, joinTime: new Date(joinTime), course: course }); // Use your model
        await attendance.save(); // Save to MongoDB

        // Respond to the client
        res.status(200).json({ message: 'Join successful', joinTime: joinTime });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: 'Database error' });  // Send error to client
    }
});

// In routes/dashboardRoutes.js
router.get('/student-report', authMiddleware, async (req, res) => {
  try {
      const userId = req.user.id; // Get the user ID from the request
      const attendances = await LectureAttendance.find({ userId: userId }) // Fetch attendance records for the logged-in student
          .populate('userId', 'name email') // Populate user details if needed
          .exec();

      res.render('student-report', { user: req.user, attendances }); // Pass user and attendance data to the template
  } catch (error) {
      console.error('Error fetching attendance report:', error);
      res.status(500).send('Internal Server Error');
  }
});

router.get('/lecture/:course', authMiddleware, (req, res) => {
  const { course } = req.params;
  res.render('lecture', { course }); // Pass the course to the lecture page
});


// Other routes...
router.post('/selectCourse', authMiddleware, dashboardController.selectCourse);
router.post('/joinLecture', authMiddleware, dashboardController.joinLecture);
router.post('/leaveLecture', authMiddleware, dashboardController.leaveLecture);



module.exports = router;