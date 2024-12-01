const mongoose = require('mongoose');

const LectureAttendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentRecord', required: true }, // Change 'User ' to 'StudentRecord'
    joinTime: { type: Date, required: true },
    course: { type: String, required: true } // Optional: Store the course name
});

const LectureAttendance = mongoose.model('LectureAttendance', LectureAttendanceSchema);
module.exports = LectureAttendance;