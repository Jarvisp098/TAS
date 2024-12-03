const mongoose = require('mongoose');

const LectureAttendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentRecord', required: true },
    joinTime: { type: Date, required: true },
    course: { type: String, enum: ['Java', 'Python'], required: true }, // Specify the course
    status: { type: String, enum: ['attended', 'missed'], default: 'attended' }, // Status of attendance
});

const LectureAttendance = mongoose.model('LectureAttendance', LectureAttendanceSchema);
module.exports = LectureAttendance;