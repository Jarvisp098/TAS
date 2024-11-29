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
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: { 
        type: String, required: true 
    },
    
    attendance: {
        type: [attendanceSchema],
        default: [],
    },

    course: {
        type: String, // or enum if needed
        required: true // If it must be selected
    },
    role: { type: String, default: 'student' }
});

const StudentRecord = mongoose.model('StudentRecord', studentRecordSchema);

module.exports = StudentRecord;