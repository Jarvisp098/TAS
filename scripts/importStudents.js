// In a separate file, e.g., importStudents.js
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // For password hashing
const StudentRecord = require('./models/studentRecord'); // Your StudentRecord model
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB for import');

    try {
      const data = fs.readFileSync('students.json', 'utf8');  // Correct path to your students.json
      const students = JSON.parse(data);

      for (const student of students) {
        const hashedPassword = await bcrypt.hash('defaultPassword', 10); // Hash a default password - CHANGE THIS!

        const existingStudent = await StudentRecord.findOne({ email: student.email });

        if(!existingStudent){
                await StudentRecord.create({
                name: student.name,
                email: student.email,
                password: hashedPassword, // Store the hashed password
                role: 'student'  //  Add the role directly during import
              });
        }

      }
      console.log('Students imported successfully!');
      process.exit(0); // Exit the script after import

    } catch (err) {
      console.error('Error importing students:', err);
      process.exit(1);
    }
  })
  .catch((err) => console.error('MongoDB Connection Error:', err));


