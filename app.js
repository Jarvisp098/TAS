const express = require('express');
const mongoose = require('mongoose');
const app = express();
const YAML = require('yamljs');
const initializeDatabase = require('./data/initializeDatabase.js');
const swaggerUI = require('swagger-ui-express');
const bodyParser = require('body-parser');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes.js');
const studentRoutes = require('./routes/studentRoutes.js');
const dashboardRoutes = require('./routes/dashboardRoutes');
const studentCountRoutes = require('./routes/studentCount');
const LectureAttendance = require('./models/lectureAttendance'); // Use LectureAttendance instead
const StudentRecord = require('./models/studentRecord');
const reportRoutes = require('./routes/reportRoutes');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3000;
const moment = require('moment');

//swagger documentation
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));


//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then( async() => { 
    console.log('Connected to MongoDB Database');
    //await initializeDatabase();
 })
.catch((err) => { console.log(`Error connecting to database: ${err}`) });

//View engines
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


//Middlewares
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());        // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true }));
app.use('/', authRoutes);
app.use('/', studentRoutes);
app.use('/', dashboardRoutes);
app.use('/api', studentCountRoutes);
app.use('/api', reportRoutes);


app.use((err, req, res, next) =>{
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
    next();
});

// Get total student count
app.get('/api/getStudentCount', async (req, res) => {
  try {
      const totalStudents = await StudentRecord.countDocuments({});
      res.json({ totalStudents });
  } catch (error) {
      console.error('Error fetching student count:', error);
      res.status(500).json({ error: 'Failed to fetch student count' });
  }
});

// Get Java enrolled students count
app.get('/api/getJavaEnrolledCount', async (req, res) => {
  try {
      const javaCount = await StudentRecord.countDocuments({ selectedCourse1: 'Java' });
      const bothCount = await StudentRecord.countDocuments({ selectedCourse2: 'Java' });
      res.json({ javaCount: javaCount + bothCount });
  } catch (error) {
      console.error('Error fetching Java enrolled count:', error);
      res.status(500).json({ error: 'Failed to fetch Java count' });
  }
});

// Get Python enrolled students count
app.get('/api/getPythonEnrolledCount', async (req, res) => {
  try {
      const pythonCount = await StudentRecord.countDocuments({ selectedCourse1: 'Python' });
      const bothCount = await StudentRecord.countDocuments({ selectedCourse2: 'Python' });
      res.json({ pythonCount: pythonCount + bothCount });
  } catch (error) {
      console.error('Error fetching Python enrolled count:', error);
      res.status(500).json({ error: 'Failed to fetch Python count' });
  }
});

// Get attendance percentage
app.get('/api/getAttendancePercentage', async (req, res) => {
    try {
        // Total number of students for Java
        const totalJavaStudents = await StudentRecord.countDocuments({ selectedCourses: 'Java' });
        // Total number of students for Python
        const totalPythonStudents = await StudentRecord.countDocuments({ selectedCourses: 'Python' });

        // Total number of students who attended Java lectures
        const attendedJavaStudents = await LectureAttendance.countDocuments({ course: 'Java', status: 'attended' });
        // Total number of students who attended Python lectures
        const attendedPythonStudents = await LectureAttendance.countDocuments({ course: 'Python', status: 'attended' });

        // Calculate attendance percentage for Java
        const javaPercentage = totalJavaStudents > 0 ? Math.min(((attendedJavaStudents / totalJavaStudents) * 100).toFixed(2), 100) : 0;
        // Calculate attendance percentage for Python
        const pythonPercentage = totalPythonStudents > 0 ? Math.min(((attendedPythonStudents / totalPythonStudents) * 100).toFixed(2), 100) : 0;
        // Return the result
        res.json({ javaPercentage, pythonPercentage });
    } catch (error) {
        console.error('Error fetching attendance percentage:', error);
        res.status(500).json({ error: 'Failed to fetch attendance percentage' });
    }
});
  
  
app.post('/joinLecture', async (req, res) => {
    const { joinTime, subject, studentEmail, lectureId } = req.body; // Make sure to include lectureId

    // Check if lectureId is provided
    if (!lectureId) {
        return res.status(400).json({ message: 'Lecture ID is required' });
    }

    const attendanceRecord = {
        userId: studentEmail, // Assuming you will store email or student ID
        joinTime: joinTime,
        course: subject, // Use 'subject' as 'course'
        lectureId: lectureId // Include lectureId here
    };

    try {
        const newAttendance = new LectureAttendance(attendanceRecord);
        await newAttendance.save();
        res.json({ message: 'Join successful', joinTime: joinTime });
    } catch (error) {
        res.status(500).json({ message: 'Error joining lecture', error: error.message });
    }
});

  app.get('/generateReport', async (req, res) => {
    try {
        const { subject, fromDate, toDate } = req.query; // Get filter parameters from query string

        // Build the filter query based on input
        const filter = {};
        if (subject) {
            filter.course = subject; // Assuming you have a 'course' field in LectureAttendance
        }
        if (fromDate) {
            filter.joinTime = { $gte: new Date(fromDate) }; // Ensure proper date format
        }
        if (toDate) {
            if (filter.joinTime) {
                filter.joinTime.$lte = new Date(toDate);
            } else {
                filter.joinTime = { $lte: new Date(toDate) };
            }
        }

        const attendanceData = await LectureAttendance.find(filter); // Use LectureAttendance model
        const reportData = processAttendanceData(attendanceData);
        res.render('report', { reportData, subject, fromDate, toDate }); // Render the 'report.ejs' template

    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).send("Error generating report");
    }
});


function processAttendanceData(attendanceData) {

    const groupedData = {};


    attendanceData.forEach(record => {
        const student = record.studentEmail;  // Change to studentName if that's the identifier for uniqueness
        if (!groupedData[student]) {
            groupedData[student] = [];
        }
        groupedData[student].push(record);
    });



    //Transforming data to the desired format
    const formattedReportData = Object.keys(groupedData).map(student => ({
      student: student,
      attendances: groupedData[student].map(attendance => moment(attendance.joinTime).format('YYYY-MM-DD HH:mm:ss')), // Format date as needed
      totalAttendance: groupedData[student].length
    }));

    return formattedReportData;
}

app.get('/', (req, res) => {
    res.render('login'); 
  });

//Start server
app.listen(PORT, () =>{
    console.log(`Connected to port ${PORT}`);
});