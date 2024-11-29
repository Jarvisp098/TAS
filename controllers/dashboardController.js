// dashboardController.js
const User = require('../models/attendanceManager.js'); // Import your User model

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


