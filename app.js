var express = require('express');
var fs = require('fs');
require('dotenv').config();
var multer = require('multer');
var session = require('express-session')
var path = require('path');
var app = express();

var initiateMongoConnection = require("./database/init");
var userModel = require("./database/models/user");
var todoModel = require('./database/models/todos')



app.set("view engine", "ejs");

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}))

app.use(express.urlencoded({extended : true}));

app.use(express.static("./ToDoFrontend"));
app.use(express.static("./uploads"));


//CHECK_IF_USER_IS_LOGGED_IN
function checkAuth(req, res, next){
  if(req.session.isAuthenticated){
    next();
    return;
  }

  res.redirect("/login");
}


//HOME_PAGE
app.get("/", checkAuth, function(req, res){
  var user = req.session.user;

  todoModel.find({ user})
  .then(function(todos){
    res.render("index.ejs", {username : user, todos, err : null});
  })

})


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images');
  }
})

const upload1 = multer({storage: storage })

//ADD_A_TODO
app.post("/add-todo", checkAuth, upload1.single("task-picture"), function(req,res){
  var todo = {
    value : req.body.value,
    completed : false,
    imagePath : req.file.filename,
    user : req.session.user
  }

  todoModel.create(todo)
  .then(function(){
    res.redirect("/");
  })

})

//DELETE_TODO
app.post("/delete-todo/:id", checkAuth, (req, res)=>{

  var id = req.params.id;

  var findTodo = todoModel.findOne({ _id : new ObjectId(id)})

  var deleteTodo = todoModel.deleteOne({_id : new ObjectId(id)})

  findTodo
  .then(function(todo){
    deleteTodo
    .then(function(){
      fs.unlink(__dirname + "/uploads/images/" + todo.imagePath, function(err){
        if(err){
          console.log("error deleting file from folder");
          res.redirect('/');
          return;
        }
        res.redirect("/");
      });
    })
  })
    
})

//CHANGE_TODO_STATUS
app.post("/change-todo-status/:id", checkAuth, (req, res)=>{
  var id = req.params.id;
  options = {}

  todoModel.findById(new ObjectId(id))
  .then(function(doc){
    doc.completed = !doc.completed;
    return doc;
  })
  .then(function(doc){
    doc.save();
  })
  .then(function(){
    res.redirect('/')
  })

})

//LOGIN GET
app.get('/login', function(req, res){
  if(req.session.isAuthenticated){
    res.redirect('/');
    return;
  }
  res.render("login.ejs", {err : null});
})

//LOGIN POST
app.post("/login", function(req, res){
  var username = req.body.username;
  var password = req.body.password;

  userModel.findOne({ username : req.body.username})
  .then(function(user){
    if(user){
      if(user.password === password){
        req.session.isAuthenticated = true;
        req.session.user = username;
        res.redirect("/");
        return;
      }
    }
    res.render("login.ejs", {err : "user does not exist"})
  })

})

//SIGNUP_GET
app.get('/signup', function(req, res){
  res.render("signup.ejs", {err : null});
})

//SIGNUP_POST
app.post("/signup", function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  var x = 78;
  var user = {
    username,
    password
  }

  userModel.findOne({username})
  .then(function(user1){
    if(user1){
      res.render("signup.ejs", {err : "username already taken"});
    }
    return user1;
  })
  .then(function(user1){
    if(!user1){
      return userModel.create(user);
    }
    return 0;
  })
  .then(function(user1){
    if(user1 !== 0)
      res.redirect('/user/login');
  }) 

})

//LOGOUT
app.post("/logout", checkAuth, function(req, res){
  req.session.isAuthenticated = false;
  delete req.session.user;
  res.redirect('/login');
})


//CONNECT DB
initiateMongoConnection()
.then(function(){
  console.log("DB CONNECTED");
  const PORT = 3000;
  app.listen(PORT, function(){
    console.log(`server is listening at port ${PORT}`);
  })
})
  
