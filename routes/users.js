var express           = require('express');
var router            = express.Router();
var expressValidator  = require('express-validator');
  var passport        = require('passport');
var LocalStrategy     = require('passport-local').Strategy;
var nodemailer        = require('nodemailer');

var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('respond with a resource');
});

router.get('/register', function(req, res, next){
  res.render('register',{
    'title' : 'Register'
  });
});

router.get('/login', function(req, res, next){
  res.render('login',{
    'title' : 'Login'
  });
});

router.post('/register', function(req, res, next){
  //get form values
  var username = req.body.username;
  var email    = req.body.email;
  var password = req.body.password;
  var confirm  = req.body.confirm;

  // Check profile image
  if(req.files && req.files.pofileimage){
    console.log('routes/users - Uploading File...');
    var profileImageOriginalName    = req.files.profileimage.originalname;
    var profileImageNAme            = req.files.profileimage.name;
    var profileImageMimeType        = req.files.profileimage.mimetype;
    var profileImagePath            = req.files.profileimage.path;
    var profileImageExt             = req.files.profileimage.extension;
    var profileImageSize            = req.files.prpfileimage.size;
  }else{
    var profileImageNAme            = 'noimage.png';
    var profileImagePath            = '/images/noimage.png';
  }

  //Form validation
  req.checkBody('username', 'Username field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty().isEmail();
  req.checkBody('password', 'Password field is required').notEmpty();
  req.checkBody('confirm', 'Passwords do not match').equals(password);

  // Check for errors
  var errors = req.validationErrors();

  //Check for username
  User.getUserByUsername(username, function(err, user){
    console.log('testing username exists');
    if(err){
      console.log('routes/users/register - check username ' + err);
      return;
    }
    if(user){
      console.log('routes/users - user found');
      var error = {param: "username", msg: "Username already in use", value: "<received input>"};
      if (!errors){
        errors = [];
      }
      errors.push(error);
      console.log('routes/users - error ' + errors);
    }
  });


  console.log('out of get user - ' + errors);
  if(errors){
    res.render('register', {
      errors    : errors,
      username  : username,
      email     : email,
      password  : password,
      confirm   : confirm
    });
  }else{
    var newUser = new User({
      username    : username,
      email       : email,
      password    : password,
      profileImage: profileImagePath,
      confirmed   : 'N'
    });

    //Create a new User
    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log('routes/users ' + user);
    });

    // Send email to confirm existing email address
    var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'mongodblog@gmail.com',
        pass: 'georgiancollege'
      }
    });
    var mailOptions = {
      from: req.body.email,
      to: email,
      subject: 'MongoBlog - Email confirmation',
      text: ' Please confirm your email: \nhttps://advweb.herokuapp.com/users/confirm?username=' + username + '&code=' + password,
      html: '<p>Please confirm your email: <a href="https://advweb.herokuapp.com/users/confirm?username=' + username + '&code=' + password + '">confirm</a>',
    };

    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        console.log('routes/users - registration email error ' +error);
      }

      console.log('Registration message sent: ' + info.response);
    });

    //Success message
    req.flash('success', 'You are now registered. Please check your email to confirm your account');
    res.location('/');
    res.redirect('/');
  }
});

passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  User.getUserById(id, function(err, user){
    done(err, user);
  });
});


passport.use(new LocalStrategy(
  function(username, password, done){
    User.getUserByUsername(username, function(err, user){
      if(err) throw err;
      if(!user){
        console.log('routes/users.js - Unknow user');
        return done(null, false,{message: 'Unknown User'});
      }

      User.comparePassword(password, user.password, function(err, isMatch){
        console.log('routes/users - compare password');
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        }else{
          console.log('routes/users - Invalid Password');
          return done(null, false,{message:'Invalid Password'});
        }
      });
    });
  }
));

router.post('/login', passport.authenticate('local',
          {failureRedirect:'/users/login', failureFlash:'Invalid username or password'}),
          function(req, res){
            console.log('routes/users - Authentication successful');
            req.flash('success', 'You are logged in');
            res.redirect('/');
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You have logged out');
  res.redirect('/users/login');
});


module.exports = router;
