const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

//home route
router.get('/home', studentController.getHome);

//Student management routes
router.post('/addstudent', studentController.addStudent);
router.post('/deletestudent', studentController.deleteStudent);
router.post('/updatestudent', studentController.updateStudent);

module.exports = router;