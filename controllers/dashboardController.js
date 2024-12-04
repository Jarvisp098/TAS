// dashboardController.js
const User = require('../models/attendanceManager.js'); // Import your User model
const StudentRecord = require('../models/studentRecord');
const LectureAttendance = require('../models/lectureAttendance'); // Import the LectureAttendance model


exports.markJavaAttendance = async (req, res) => {
    try {
        const user = await StudentRecord.findById(req.user.id);
        if (!user) { // Handle the case where user might not be found
          return res.status(404).send("User not found");
        }
        user.javaAttendance.push({
            date: new Date(),
            name: req.user.name, // Assuming req.user.name contains the name
            email: req.user.email, // Assuming req.user.email contains the email
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
        const userId = req.user.id; // Get the user ID from the request
        const { course } = req.body; // Get the selected course from the request body

        // Log the received course selection and user ID
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
            user.selectedCourses.push('Java'); // Adjust the field name as necessary
        } else if (course === 'Python') {
            user.selectedCourses.push('Python'); // Adjust the field name as necessary
        }

        await user.save(); // Save the changes to the database
        console.log('Updated user selected courses:', user.selectedCourses); // Log updated courses
        res.status(200).send('Course selected successfully');
    } catch (error) {
        console.error('Error in selectCourse:', error); // Log any errors
        res.status(500).send('Internal Server Error');
    }
};

exports.joinLecture = async (req, res) => {
    const { course, joinTime } = req.body; // Get course and joinTime from the request body
    const userId = req.user.id; // Get the user ID from the request

    console.log(`User  ID: ${userId} is attempting to join course: ${course} at ${joinTime}`); // Log user and course info

    try {
        // Ensure joinTime is a valid date
        if (!joinTime || isNaN(new Date(joinTime))) {
            return res.status(400).json({ error: "Invalid Join Time" });
        }

        const attendanceRecord = new LectureAttendance({
            userId: userId,
            joinTime: new Date(joinTime), // Store the join time as a Date object
            course: course // Store the course name
        });

        await attendanceRecord.save(); // Save the attendance record
        console.log(`Successfully joined lecture for course: ${course}`); // Log success
        res.status(200).json({ message: 'Lecture joined successfully' }); // Respond with success
    } catch (error) {
        console.error("Error joining lecture:", error); // Log the error
        res.status(500).send('Error joining lecture'); // Respond with an error
    }
};

exports.leaveLecture = async (req, res) => {
    try {
        const { course, leaveTime } = req.body; // Get course and leave time from the request body
        const userId = req.user.id; // Get the user ID from the request

        // Find the attendance record for the current lecture
        const attendanceRecord = await LectureAttendance.findOne({
            userId: userId,
            course: course,
            joinTime: { $exists: true } // Ensure there is a join time
        }).sort({ joinTime: -1 }); // Get the most recent join record

        if (!attendanceRecord) {
            return res.status(404).send('No active lecture found to leave');
        }

        // Update the attendance record with the leave time
        attendanceRecord.leaveTime = new Date(leaveTime); // Add leave time
        await attendanceRecord.save(); // Save the changes

        res.status(200).send('Lecture left successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};