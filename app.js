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
const Attendance = require('./models/attendance');

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


app.use((err, req, res, next) =>{
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
    next();
});

app.get('/api/getStudentCount', async (req, res) => {
    try {
      const totalStudents = await StudentRecord.countDocuments({});
      res.json({ totalStudents });
    } catch (error) {
      console.error('Error fetching student count:', error);
      res.status(500).json({ error: 'Failed to fetch student count' });
    }
  });
  
  
  app.post('/joinLecture', (req, res) => {
      const { joinTime, subject, studentName, studentEmail } = req.body;
      const attendanceRecord = {
          studentName: studentName,
          studentEmail: studentEmail,
          subject: subject,
          joinTime: joinTime
        };
        // Assuming you have a MongoDB connection and a model named 'Attendance'
        const Attendance = require('./models/studentRecord');
  
        const newAttendance = new Attendance(attendanceRecord);
        newAttendance.save()
          .then(savedRecord => {
              res.json({ message: 'Join successful', joinTime: joinTime });
          })
          .catch(error => {
            res.status(500).json({ message: 'Error joining lecture' });
          });
  });

  app.get('/generateReport', async (req, res) => {
    try {
        const { subject, fromDate, toDate } = req.query; // Get filter parameters from query string


        // Build the filter query based on input
        const filter = {};
        if (subject) {
          filter.subject = subject;
        }
        if (fromDate) {
          filter.joinTime = { $gte: fromDate }; // Assumes joinTime is stored as String
        }
        if (toDate) {
          if (filter.joinTime) {
            filter.joinTime.$lte = toDate;
          } else {
            filter.joinTime = { $lte: toDate };
          }
        }


        const attendanceData = await Attendance.find(filter);
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

  
  app.get('/getAttendanceData', async (req, res) => {
    try {
      const attendanceData = await Attendance.find({}); // Get all attendance records
      res.json(attendanceData); 
    } catch (error) {
      res.status(500).json({ message: 'Error fetching data' });
    }
  });

app.get('/', (req, res) => {
    res.render('login'); 
  });

//Start server
app.listen(PORT, () =>{
    console.log(`Connected to port ${PORT}`);
});