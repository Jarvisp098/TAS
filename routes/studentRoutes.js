const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

//home route
router.get('/home', studentController.getHome);

//Student management routes
router.post('/add-student', studentController.addStudent);
router.post('/update-attendance', studentController.updateAttendance);

module.exports = router;