// models/attendance.js (create this file)
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentName: String,
  studentEmail: String,
  subject: String, // 'Java' or 'Python'
  joinTime: String  // Or Date, if you prefer to store it as a Date object
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
