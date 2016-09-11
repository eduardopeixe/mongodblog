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
    type: String,
  },
  profileImage: {
    type: String
  }
});


// Make object available outside of this file
var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
  newUser.save(callback);
};
