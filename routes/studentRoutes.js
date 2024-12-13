const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.post('/api/add-student', studentController.addStudent);
router.post('/api/update-student', studentController.updateStudent);
router.get('/api/get-student/:studentId', studentController.getStudentById);
router.post('/api/delete-student', studentController.deleteStudent);
router.get('/api/edit-student-form', (req, res) => {
    res.render('editStudentForm');
});

module.exports = router;