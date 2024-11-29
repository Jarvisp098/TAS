// routes/studentCount.js

const express = require('express');
const router = express.Router();
// Import your MongoDB connection/model
const Student = require('../models/studentRecord'); // Replace with your student model path

router.get('/getStudentCount', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments(); // Count all documents in the collection
    res.json({ totalStudents });
  } catch (error) {
    console.error('Error fetching student count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
