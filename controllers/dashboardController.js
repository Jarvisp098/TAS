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


// Similarly for selectCourse2
