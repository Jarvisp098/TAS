const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); 
const authMiddleware = require('./authMiddleware'); 
const moment = require('moment');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const dashboardController = require('../controllers/dashboardController');
const enrollmentCountsRoutes = require('./studentCount');
const LectureAttendance = require('../models/lectureAttendance');

//Database Connection
mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

router.get('/admin-dashboard', authMiddleware, (req, res) => { 
    if (!res.locals.user) {
      return res.redirect('/login');
    }
  
    if (res.locals.user.role !== 'admin') { 
      return res.redirect('/student-dashboard');
    }
  
   
    res.render('admin-dashboard', {user: res.locals.user});
  
  });
  
  
router.get('/student-dashboard', authMiddleware, (req, res) => {
    if (!res.locals.user) {   
      return res.redirect('/login');
    }
  
      if (res.locals.user.role !== 'student') { 
        return res.redirect('/admin-dashboard');
      }
  
      res.render('student-dashboard', {user: res.locals.user, course: null});
  
  });
  

  router.post('/joinLecture', authMiddleware, async (req, res) => { 
    const { course, joinTime } = req.body; 

    if (!joinTime) {
        return res.status(400).json({ error: "Invalid Join Time" });
    }

    try {
        const userId = req.user.id; 
        const attendance = new LectureAttendance({ userId: userId, joinTime: new Date(joinTime), course: course }); 
        await attendance.save(); 

        res.status(200).json({ message: 'Join successful', joinTime: joinTime });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/student-report', authMiddleware, async (req, res) => {
  try {
      const userId = req.user.id;
      const attendances = await LectureAttendance.find({ userId: userId }) 
          .populate('userId', 'name email') 
          .exec();

      res.render('student-report', { user: req.user, attendances }); 
  } catch (error) {
      console.error('Error fetching attendance report:', error);
      res.status(500).send('Internal Server Error');
  }
});

router.get('/lecture/:course', authMiddleware, (req, res) => {
  const { course } = req.params;
  res.render('lecture', { course });
});

router.get('/edit-student', authMiddleware, (req, res) => {
  res.render('editStudentForm'); 
});


router.post('/selectCourse', authMiddleware, dashboardController.selectCourse);
router.post('/joinLecture', authMiddleware, dashboardController.joinLecture);
router.post('/leaveLecture', authMiddleware, dashboardController.leaveLecture);



module.exports = router;