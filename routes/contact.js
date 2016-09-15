var express           = require('express');
var router            = express.Router();
var nodemailer        = require('nodemailer');
var expressValidator  = require('express-validator');
var flash             = require('connect-flash');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('contact', {title : 'Contact'})
});

/* GET users listing. */
router.post('/send', function(req, res, next) {
  //Get contact information
  //get form values
  var name     = req.body.name;
  var email    = req.body.email;
  var message  = req.body.message;

  //Form validation
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('message', 'Text field is required').notEmpty();

  // Check for errors
  var errors = req.validationErrors();

  if(errors){
    res.render('contact', {
      errors    : errors,
      name      : name,
      email     : email,
      message   : message
    });
  }else{
    var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: { 
        user: 'mongodblog@gmail.com',
        pass: 'georgiancollege'
      }
    });

    var mailOptions = {
      from: req.body.email,
      to: 'mongodblog@gmail.com',
      subject: 'Website Submission',
      text: ' Yout have a new submission with the following details...Name: ' + req.body.name+ ' \nEmail: ' + req.body.email + ' \nMessage: ' + req.body.message,
      html: '<p>You got a new submission with the following details..</p><ul><li>Name ' +req.body.name+ '</li><li>Email: ' +req.body.email+ '</li><li>Message: ' +req.body.message + '</li></ul>',
    };

    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        console.log('contact.js error ' +error);
        res.redirect('/');
      }
      //Success message
      req.flash('success', 'Message sent. Thank you for you contact!');
      res.location('/');
      res.redirect('/');

      console.log('Message sent: ' + info.response);
    });
  }


});
module.exports = router;
