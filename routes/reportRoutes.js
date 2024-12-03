// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const LectureAttendance = require('../models/lectureAttendance'); // Adjust the path as needed

// Endpoint to generate report based on date range
router.get('/generateReport', async (req, res) => {
    const { fromDate, toDate } = req.query;

    try {
        // Convert the dates to Date objects
        const start = new Date(fromDate);
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999); // Set end date to the end of the day

        // Query the database for attendance records within the date range
        const attendanceRecords = await LectureAttendance.find({
            joinTime: { $gte: start, $lte: end }
        }).populate('userId', 'name email'); // Populate user details

        // Send the attendance records as the response
        res.json(attendanceRecords);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;