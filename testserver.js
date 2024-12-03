const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`
        <form action="/register" method="POST">
            <label>Name:</label><input type="text" name="name" required>
            <label>Email:</label><input type="email" name="email" required>
            <label>Password:</label><input type="password" name="password" required>
            <label>Confirm Password:</label>< input type="password" name="confirmPassword" required>
            <label>Select Courses:</label>
            <label><input type="checkbox" name="course" value="Java"> Java</label>
            <label><input type="checkbox" name="course" value="Python"> Python</label>
            <button type="submit">Register</button>
        </form>
    `);
});

app.post('/register', (req, res) => {
    console.log("Request Body:", req.body);
    res.send("Form submitted!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});