const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique:true
  },
  password: String
});

//var todoSchema = new mongoose.Schema({
 // value : {
//    type : String
//  },
//  completed : Boolean,
//  imagePath : String,
//  user : String
//})

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;

