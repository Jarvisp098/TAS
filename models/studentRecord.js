const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['present', 'absent'],
        required: true,
    },
});

const studentRecordSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    selectedCourse1: { type: String },
    selectedCourse2: { type: String },
    attendance: {
        type: [attendanceSchema],
        default: [],
    },
});

const StudentRecord = mongoose.model('StudentRecord', studentRecordSchema);
module.exports = StudentRecord;