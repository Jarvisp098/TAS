const express = require('express');
const router = express.Router();
const StudentRecord = require('../models/studentRecord');
const LectureAttendance = require('../models/lectureAttendance');

// Route to fetch report data
// router.get('/report', async (req, res) => {
//     try {
//         // Fetch all students and their attendance records
//         const students = await StudentRecord.find().populate('attendance', 'date status course');

//         // Prepare the report data
//         const reportData = students.map((student) => {
//             const lectureAttendances = student.attendance;
//             return lectureAttendances.map((attendance, index) => ({
//                 index: index + 1,
//                 date: attendance.date,
//                 studentName: student.name,
//                 emailAddress: student.email,
//                 courseEnrolled: attendance.course,
//                 lectureJoinTime: attendance.joinTime,
//                 lectureLeaveTime: attendance.leaveTime,
//                 attendanceStatus: attendance.status,
//             }));
//         });

//         // Flatten the report data
//         const flattenedReportData = [].concat(...reportData);

//         // Send the report data as JSON
//         res.json(flattenedReportData);
//     } catch (error) {
//         console.error('Error generating report:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

router.get('/report', async (req, res) => {
    try {
        const attendances = await LectureAttendance.find()
            .populate('userId', 'name email') // Populate userId to get student details
            .exec();

        const reportData = attendances.map(attendance => {
            if (attendance.userId) { // Check if userId is not null
                return {
                    studentName: attendance.userId.name,
                    emailAddress: attendance.userId.email,
                    courseEnrolled: attendance.course,
                    lectureJoinTime: attendance.joinTime,
                    lectureLeaveTime: attendance.leaveTime,
                    attendanceStatus: attendance.status,
                };
            } else {
                // Handle the case where userId is null
                return {
                    studentName: 'Unknown', // or any default value
                    emailAddress: 'N/A',
                    courseEnrolled: attendance.course,
                    lectureJoinTime: attendance.joinTime,
                    lectureLeaveTime: attendance.leaveTime,
                    attendanceStatus: attendance.status,
                };
            }
        });

        res.json(reportData); // Ensure this returns JSON
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;