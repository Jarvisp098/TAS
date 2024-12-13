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
    studentId: { type: String, unique: true, required: true }, 
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['student', 'admin'] },
    selectedCourses: [{ type: String, enum: ['Java', 'Python'] }], 
    attendance: {
        type: [attendanceSchema],
        default: [],
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Static variable to keep track of the last used student ID
studentRecordSchema.statics.lastStudentId = 0;

// Middleware to update the updatedAt field on save
studentRecordSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const StudentRecord = mongoose.model('StudentRecord', studentRecordSchema);
module.exports = StudentRecord;