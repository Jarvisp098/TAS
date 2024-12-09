const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');


//Student management routes
router.post('/api/add-student', studentController.addStudent);
// Update Student
router.post('/api/update-student', studentController.updateStudent);
// studentRoutes.js
router.get('/api/get-student/:studentId', studentController.getStudentById);
// Delete Student
router.post('/api/delete-student', studentController.deleteStudent);

router.get('/api/edit-student-form', (req, res) => {
    res.render('editStudentForm'); // Adjust the path if necessary
});

module.exports = router;