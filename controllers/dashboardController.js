// dashboardController.js
const User = require('../models/attendanceManager.js'); // Import your User model
const StudentRecord = require('../models/studentRecord');
const LectureAttendance = require('../models/lectureAttendance'); // Import the LectureAttendance model

exports.selectCourse1 = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.selectedCourse1 = 'Maths'; // Update the user's selected course
        await user.save();
        res.redirect('/student-dashboard'); // Or send a JSON response if using AJAX
    } catch (error) {
        // Handle error
    }
};

// dashboardController.js
exports.selectCourse2 = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.selectedCourse2 = 'Biology';  // Or whatever course name
        await user.save();
        res.redirect('/student-dashboard'); // Or a suitable redirect
    } catch (error) {
        // Handle the error
        console.error(error)
        res.status(500).send('Internal Server Error') // Or a proper error response
    }
};

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

        // Find the user and update the selected course
        const user = await StudentRecord.findById(userId);
        if (!user) {
            return res.status(404).send('User  not found');
        }

        // Store the selected course in the appropriate field
        if (course === 'Java') {
            user.selectedCourse1 = 'Java'; // Adjust the field name as necessary
        } else if (course === 'Python') {
            user.selectedCourse2 = 'Python'; // Adjust the field name as necessary
        }

        await user.save(); // Save the changes to the database
        res.status(200).send('Course selected successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.joinLecture = async (req, res) => {
    try {
        const { course, joinTime } = req.body; // Get data from the request body
        const userId = req.user.id; // Get the user ID from the request

        // Create a new attendance record
        const attendanceRecord = new LectureAttendance({
            userId: userId,
            joinTime: new Date(joinTime), // Convert joinTime to Date object
            course: course // Store the course name
        });

        await attendanceRecord.save(); // Save the attendance record

        res.status(200).send('Lecture joined successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
