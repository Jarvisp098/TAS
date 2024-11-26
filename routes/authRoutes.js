const express = require('express');
const authController = require('../controllers/authController.js');
const router = express.Router();

//views
router.get('/login', (req, res) =>{
    res.render('login');
});

router.get('/register', (req, res) =>{
    res.render('register');
});



//contoller action
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/logout', authController.logout);


module.exports = router;