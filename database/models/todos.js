const mongoose = require('mongoose');

var todoSchema = new mongoose.Schema({
  value : {
    type : String
  },
  completed : Boolean,
  imagePath : String,
  user : String
})

const todoModel = mongoose.model('todo_lists', todoSchema);

module.exports =  todoModel;

