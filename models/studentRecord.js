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
    role: { type: String, required: true, enum: ['student', 'admin'] },
    selectedCourses: [{ type: String, enum: ['Java', 'Python'] }], // Array of courses
    attendance: {
        type: [attendanceSchema],
        default: [],
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
// Middleware to update the updatedAt field on save
studentRecordSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const StudentRecord = mongoose.model('StudentRecord', studentRecordSchema);
module.exports = StudentRecord;