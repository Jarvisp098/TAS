const express = require('express');
const router = express.Router();
const StudentRecord = require('../models/studentRecord');
const LectureAttendance = require('../models/lectureAttendance');
const json2csv = require('json2csv').parse;
const fs = require('fs');

router.get('/report', async (req, res) => {
    try {
        const attendances = await LectureAttendance.find()
            .populate('userId', 'name email') 
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

        res.json(reportData);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).send('Internal Server Error');
    }
});

// New route for generating reports
router.get('/generateReport', async (req, res) => {
    try {
        const attendances = await LectureAttendance.find()
            .populate('userId', 'name email')
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

        
        const format = req.query.format; 

        if (format === 'csv') {
            const csv = json2csv(reportData);
            res.header('Content-Type', 'text/csv');
            res.attachment('report.csv');
            res.send(csv);
        } else {
            res.status(400).send('Invalid format. Use "csv"');
        }
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;