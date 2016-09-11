var bcrypt   = require('bcrypt');
var mongoose = require('mongoose');
mongoose.connect('mongodb://dbuser:georgiancollege@ds019846.mlab.com:19846/eduardoblog');
var db = mongoose.connection;

// User schema
var UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  email: {
    type: String
  },
  password: {
    type:     String,
    required: true,
    bcrypt:   true
  },
  profileImage: {
    type: String
  }
});


// Make object available outside of this file
var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserByUsername = function(username, callback){
  var query = { username: username };
  User.findOne(query, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch){
    console.log('models/user - comparePassword');
    if(err) return callback(err);
    callback(null, isMatch);
  });
};


module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
};


module.exports.createUser = function(newUser, callback){
  bcrypt.hash(newUser.password, 10, function(err, hash){
    if(err) throw err;
    // Set hashed password
    newUser.password = hash;
    // Create User
    newUser.save(callback);
  });

};
