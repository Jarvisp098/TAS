const StudentRecord = require('../models/studentRecord');
const AttendanceManager = require('../models/attendanceManager.js');
const moment = require('moment-timezone');

exports.getHome = async (req, res) =>{
    try{
        const students = await StudentRecord.find({});

        const maxAttendanceCount = students.length;

        res.render('attendance.ejs', {students, maxAttendanceCount});

    }catch(error){
        res.status(500).send('Internal Server Error');
    }
}

exports.addStudent = async (req, res) => {
    try {
        const student = new StudentRecord({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: 'student',
            selectedCourses: req.body.selectedCourses // Ensure selectedCourses is included
        });
        await student.save();
        res.redirect('/home');
    } catch (error) {
        console.log('Error Adding Student', error);
        res.status(500).send('Internal Server Error');
    }
};



exports.deleteStudent = async (req, res) => {
    try{
       const studentName = req.body.name;
       const result = await StudentRecord.deleteOne({ name: studentName });

       if(result.deletedCount === 0){
         res.status(404).send('Student not found');
       } else {
        res.redirect('/home');
       }

    }catch(error){
       console.log('Error Adding Student');
       res.status(500).send('Internal Server Error');
    }
};


exports.updateStudent = async (req, res) =>{

    const { attendanceDate } = req.body;
    const length = req.body.attendace ? req.body.attendace.length : 0;

    console.log(req.bodyattendance);

   try{
      for(let i = 0; i < length; i++){
        const studentID = req.body.attendance[i];
        await StudentRecord.findByIdAndUpdate(
            studentID,
            {
                $inc: { attendanceCount: 1},
                $push: { attendance : {date: new Date(attendanceDate), status: 'present'}}
            },
            {new: true}
        )
      }
        res,redirect('/home');
    }catch(error){
       console.log('Error updating student records.');
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