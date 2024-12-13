const express = require('express');
const router = express.Router();

const StudentRecord = require('../models/studentRecord');

router.get('/getStudentCount', async (req, res) => {
  try {
      const totalStudents = await StudentRecord.countDocuments();
      res.json({ totalStudents });
  } catch (error) {
      console.error('Error fetching total student count:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/getJavaEnrolledCount', async (req, res) => {
  try {
      const javaCount = await StudentRecord.countDocuments({ selectedCourses: 'Java' });
      res.json({ javaCount });
  } catch (error) {
      console.error('Error fetching Java enrolled count:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/getPythonEnrolledCount', async (req, res) => {
  try {
      const pythonCount = await StudentRecord.countDocuments({ selectedCourses: 'Python' });
      res.json({ pythonCount });
  } catch (error) {
      console.error('Error fetching Python enrolled count:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
