/**
 * Module dependencies:
 * - Express 
 * - Http
 * - Body Parser
 */

 var express = require('express');
 var app = express();
 var http = require('http').createServer(app);
 var bodyParser = require('body-parser');
 var cookieParser = require('cookie-parser')
 var path = require('path');

 var favicon = require('serve-favicon');
 var logger = require('morgan');
 var underScore = require('underscore');
 var io = require('socket.io')(http);
 var User = require('./models/user');
 var mongoose = require('mongoose');
 var session = require('express-session');

 /**for db */
 global.dbHandel = require('./models/dbHandel');

 /**connect mongoose */
 global.mongoose = mongoose.connect("mongodb://localhost:27017/chatroom");

 app.use(session({
    key: 'user_sid',
    secret: 'My work is in my heart',
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000*60*30
    }
 }));

 /**
  * Server Config
  */

/** config ip */
app.set('ip', '127.0.0.1');

/** config port */
app.set('port', 8080);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//specify where the static content is
app.use(express.static(path.join(__dirname, 'public')));

app.use(logger('dev'));
/** JSON support */
app.use(bodyParser.json());
// support encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 

/**cookie support */
app.use(cookieParser());


/** handle routes */

/** store online users */
var users_online = {};

/**handle get '/' */
app.get('/', function(req, res) {
    /**go to chatroom if session is not null */
    if (req.session.user) {
        res.render('index', {title: "Go to ChatRoom"});
    } else {
        res.redirect('/login');
    }
  });

  
/**handle login: return login if "GET" method  */
app.route('/login').get(function(req, res) {
    res.render('login', {title: 'User Login'});
});

/**handle login: auth the username and password if "POST" method  */
app.route('/login').post(function(req, res, next) {
    var User = global.dbHandel.getModel('user');  
    var username = req.body.username;			
    if (users_online[username]) {
        res.redirect('/login');
    }
    User.findOne({username: username}, function(err, user) {   
        if(err || !user){ 	
            res.status(404);								
            res.render('login', {'message':'User does not exist.'});
        } else{ 
            if(req.body.password != user.password){ 
                res.status(404);
                res.render('login', {'message':'The username or password does not match.'});
            } else {
                res.clearCookie("user");
                res.cookie('user', username, {maxAge: 1000*60*60*24});
                req.session.user = user.username;
                res.send(200);
            }
        }
    });
});

  // register
  app.route("/register").get(function(req, res) { 
      res.render("register", {title: 'User register'});
  })
  
  app.route("/register").post(function(req, res, next) { 
    var User = global.dbHandel.getModel('user');
    var username = req.body.username;
    var password = req.body.password + "";
    var password1 = req.body.password1 + "";
    console.log(password)
    User.findOne({username: username}, function(err, user) {
        if(err || user){ 
            res.status(404);
            res.render('register', {'message':'The username has already exist.'});
        } else if(password.length < 6) {
            res.status(404);
            res.render('register', {'message':'The password is too short.'});
        } else if (password != password1) {
            res.status(404);
            res.render('register', {'message':'The two passwords are not same.'});
        } else { 
            User.create({ 
                username: username,
                password: password
            }, function(err, user) { 
                if (err) {
                    res.status(404);
                    console.log(err);
                } else {
                    res.send(200);
                }
            });
        }
    });
      
      
  });
  
  // logout
  app.get("/logout",function(req, res){  
      req.session.destroy();
      res.redirect("/login");
  });



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });


/* Socket.IO events */
io.on('connection', function(socket){

     /*
    When a new user connects to our server, we'll emit an event called
    "online" with a list of all online users and messages to all connected clients
    */
    socket.on("online", function(data) {
        socket.user = data.user;
        if (!users_online[data.user]) {
            users_online[data.user] = data.user;
        }
        var Message = global.dbHandel.getModel('message');
        Message.find((err, messages)=>{
            if (err) {
                console.error(err);
            }
            else {
                io.sockets.emit('online', {users_online: users_online, user: data.user, messages:messages});
            }
        });
    });

    /* when user sends a message, we will store the message into database 
       and send the message to all of the other users.
    */
    socket.on('say', function (data) {
        //store message
        var Message = global.dbHandel.getModel('message');
        Message.create({               
            username: data.from,
            createTime: data.time,
            content:data.msg
            }, function(err, message){ 
                if (err) {
                    console.error(err)
                }
        });
        socket.broadcast.emit('say', {data: data, display: "all"}); 
    });

  /** when user logout or disconnect the network, 
   * we will send a offline message to all of other users
   */
  socket.on('disconnect', function() {
    if (users_online[socket.user]) {
      delete users_online[socket.user];
      //broadcast
      socket.broadcast.emit('offline', {users_online: users_online, user: socket.user});
    }
  });

});

/** Listen this port */
http.listen(app.get('port'), app.get('ip'), function() {
    console.log('Server is running. Go to http://' + app.get('ip') + ":" + app.get('port'));
});
