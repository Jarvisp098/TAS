const mongoose = require('mongoose');

const LectureAttendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentRecord', required: true },
    joinTime: { type: Date, required: true },
    leaveTime: { type: Date },
    course: { type: String, enum: ['Java', 'Python'], required: true },
    status: { type: String, enum: ['attended', 'missed'], default: 'attended' },
});

const LectureAttendance = mongoose.model('LectureAttendance', LectureAttendanceSchema);
module.exports = LectureAttendance;