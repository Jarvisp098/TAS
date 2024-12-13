const User = require('../models/attendanceManager.js');
const StudentRecord = require('../models/studentRecord');
const LectureAttendance = require('../models/lectureAttendance'); 


exports.markJavaAttendance = async (req, res) => {
    try {
        const user = await StudentRecord.findById(req.user.id);
        if (!user) {
          return res.status(404).send("User not found");
        }
        user.javaAttendance.push({
            date: new Date(),
            name: req.user.name, 
            email: req.user.email, 
        });
        await user.save();
        res.redirect('/student-dashboard'); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

//
exports.selectCourse = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { course } = req.body; 

        console.log('Received course selection:', course);
        console.log('User  ID from request:', userId);

        // Find the user and update the selected course
        const user = await StudentRecord.findById(userId);
        if (!user) {
            console.log('User  not found:', userId);
            return res.status(404).send('User  not found');
        }

        // Log the user object before updating
        console.log('User  found:', user);

        // Store the selected course in the appropriate field
        if (course === 'Java') {
            user.selectedCourses.push('Java'); 
        } else if (course === 'Python') {
            user.selectedCourses.push('Python'); 
        }

        await user.save(); 
        console.log('Updated user selected courses:', user.selectedCourses);
        res.status(200).send('Course selected successfully');
    } catch (error) {
        console.error('Error in selectCourse:', error); 
        res.status(500).send('Internal Server Error');
    }
};

exports.joinLecture = async (req, res) => {
    const { course, joinTime } = req.body; 
    const userId = req.user.id; 
    console.log(`User  ID: ${userId} is attempting to join course: ${course} at ${joinTime}`); 

    try {
        if (!joinTime || isNaN(new Date(joinTime))) {
            return res.status(400).json({ error: "Invalid Join Time" });
        }

        const attendanceRecord = new LectureAttendance({
            userId: userId,
            joinTime: new Date(joinTime), 
            course: course 
        });

        await attendanceRecord.save();
        console.log(`Successfully joined lecture for course: ${course}`);
        res.status(200).json({ message: 'Lecture joined successfully' }); 
    } catch (error) {
        console.error("Error joining lecture:", error); 
        res.status(500).send('Error joining lecture');
    }
};

exports.leaveLecture = async (req, res) => {
    try {
        const { course, leaveTime } = req.body; 
        const userId = req.user.id; 

        // Find the attendance record for the current lecture
        const attendanceRecord = await LectureAttendance.findOne({
            userId: userId,
            course: course,
            joinTime: { $exists: true } 
        }).sort({ joinTime: -1 }); 

        if (!attendanceRecord) {
            return res.status(404).send('No active lecture found to leave');
        }

        // Update the attendance record with the leave time
        attendanceRecord.leaveTime = new Date(leaveTime);
        await attendanceRecord.save(); 

        res.status(200).send('Lecture left successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};