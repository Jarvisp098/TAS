const StudentRecord = require('../models/studentRecord');
const AttendanceManager = require('../models/attendanceManager.js');
const moment = require('moment-timezone');
const bcrypt = require('bcrypt');

exports.addStudent = async (req, res) => {
    try {
        const { name, email, password, selectedCourses } = req.body;

        // Fetch the last studentId from the database
        const lastStudent = await StudentRecord.findOne().sort({ studentId: -1 }).exec();
        let lastStudentId = lastStudent ? parseInt(lastStudent.studentId.replace('TAS', '')) : 0; // Extract the numeric part and convert to integer

        // Generate the new studentId
        const newStudentId = `TAS${String(lastStudentId + 1).padStart(2, '0')}`; // Increment and format

        // Check if the new studentId already exists (should not happen with this logic)
        const existingStudent = await StudentRecord.findOne({ studentId: newStudentId });
        if (existingStudent) {
            return res.status(400).send('Student ID already exists. Please try again.');
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

        const student = new StudentRecord({
            studentId: newStudentId, // Use the custom formatted student ID
            name,
            email,
            password: hashedPassword, // Store the hashed password
            role: 'student',
            selectedCourses: selectedCourses || [] // Ensure selectedCourses is included
        });

        await student.save();
        res.status(201).send('Student added successfully');
    } catch (error) {
        console.log('Error Adding Student', error);
        res.status(500).send('Internal Server Error');
    }
};



exports.deleteStudent = async (req, res) => {
    try {
        const { studentId } = req.body; // Get studentId from the request body

        const result = await StudentRecord.deleteOne({ studentId: studentId });

        if (result.deletedCount === 0) {
            return res.status(404).send('Student not found');
        } else {
            res.redirect('/home'); // Redirect after successful deletion
        }
    } catch (error) {
        console.log('Error deleting student:', error);
        res.status(500).send('Internal Server Error');
    }
};


exports.updateStudent = async (req, res) => {
    const { studentId, name, email } = req.body;

    try {
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;

        const updatedStudent = await StudentRecord.findOneAndUpdate({ studentId: studentId }, updateData, { new: true });

        if (!updatedStudent) {
            return res.status(404).send('Student not found');
        }

        res.redirect('/edit-student'); // Redirect back to the edit student page
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getStudentById = async (req, res) => {
    const { studentId } = req.params;

    try {
        const student = await StudentRecord.findOne({ studentId: studentId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ student });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.updateAttendance = async (req, res) => {
    try {
        const { attendanceDate } = req.body;
        const length = req.body.attendance ? req.body.attendance.length : 0;

        for (let i = 0; i < length; i++) {
            const studentID = req.body.attendance[i];
            await LectureAttendance.create({
                userId: studentID,
                joinTime: new Date(),
                course: req.body.course // Ensure course is included
            });
        }
        res.redirect('/home');
    } catch (error) {
        console.log('Error updating attendance records.', error);
        res.status(500).send('Internal Server Error');
    }
};