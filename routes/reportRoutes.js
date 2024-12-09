const express = require('express');
const router = express.Router();
const StudentRecord = require('../models/studentRecord');
const LectureAttendance = require('../models/lectureAttendance');
const json2csv = require('json2csv').parse; // For CSV conversion
const pdf = require('html-pdf'); // For PDF generation
const fs = require('fs'); // For file system operations

router.get('/report', async (req, res) => {
    try {
        const attendances = await LectureAttendance.find()
            .populate('userId', 'name email') // Populate userId to get student details
            .exec();

            const reportData = attendances.map((attendance, index) => {
                if (attendance.userId) { // Check if userId is not null
                    return {
                        index: index + 1, // Assign the index here
                        studentName: attendance.userId.name,
                        emailAddress: attendance.userId.email,
                        courseEnrolled: attendance.course,
                        lectureJoinTime: attendance.joinTime,
                        lectureLeaveTime: attendance.leaveTime,
                        attendanceStatus: attendance.status,
                        date: attendance.joinTime // Add this to access the date
                    };
                } else {
                    // Handle the case where userId is null
                    return {
                        index: index + 1, // Assign the index here as well
                        studentName: 'Unknown', // or any default value
                        emailAddress: 'N/A',
                        courseEnrolled: attendance.course,
                        lectureJoinTime: attendance.joinTime,
                        lectureLeaveTime: attendance.leaveTime,
                        attendanceStatus: attendance.status,
                        date: attendance.joinTime // Add this to access the date
                    };
                }
            });

        res.json(reportData); // Ensure this returns JSON
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).send('Internal Server Error');
    }
});

// New route for generating reports
router.get('/generateReport', async (req, res) => {
    try {
        const attendances = await LectureAttendance.find()
            .populate('userId', 'name email') // Populate userId to get student details
            .exec();

        const reportData = attendances.map((attendance, index) => {
            if (attendance.userId) {
                return {
                    index: index + 1,
                    studentName: attendance.userId.name,
                    emailAddress: attendance.userId.email,
                    courseEnrolled: attendance.course,
                    lectureJoinTime: attendance.joinTime,
                    lectureLeaveTime: attendance.leaveTime,
                    attendanceStatus: attendance.status,
                    date: attendance.joinTime
                };
            } else {
                return {
                    index: index + 1,
                    studentName: 'Unknown',
                    emailAddress: 'N/A',
                    courseEnrolled: attendance.course,
                    lectureJoinTime: attendance.joinTime,
                    lectureLeaveTime: attendance.leaveTime,
                    attendanceStatus: attendance.status,
                    date: attendance.joinTime
                };
            }
        });

        // Check for the format query parameter
        const format = req.query.format; // Get the format from the query

        if (format === 'csv') {
            const csv = json2csv(reportData);
            res.header('Content-Type', 'text/csv');
            res.attachment('report.csv');
            res.send(csv);
        } else if (format === 'pdf') {
            const html = generateHTML(reportData); // Function to generate HTML for PDF
            pdf.create(html).toFile('./report.pdf', (err, result) => {
                if (err) return res.send(Promise.reject(err));
                res.download(result.filename); // Download the generated PDF
            });
        } else {
            res.status(400).send('Invalid format. Use "csv" or "pdf".');
        }
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;