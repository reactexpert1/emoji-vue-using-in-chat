                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
const express = require("express")
// Introduce the encapsulated db module
const db = require('./models/db')
// Introduce the formidable module
const formidable = require("formidable")
const path = require("path")
const PORT = 8889;

// Create express server
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
server.listen(PORT, function () {
  console.log("listening on: 8889")
});
// Encryption and salt
const bcrypt = require('bcrypt') 
const SALT_WORK_FACTOR = 10

// Get routing middleware
let router = express.Router()
// let clientCount = 0;
let count = {};

//Monitor the client's connection, the callback function passes the socket of this connection
io.on('connection', function (socket) {
	console.log(socket)
  // Add the corresponding room according to the room number
  socket.on('joinRoom', function (roomNum) {
    socket.roomNum = roomNum;
    if (!count[roomNum]) {
      // The room does not exist, the current number of people is 1
      count[roomNum] = 1
    } else {
      // The room exists, the current number of people is increased by 1
      count[roomNum]++;
    }
    console.log(count)
    socket.join(roomNum);
  })

  // Received the online information of a user
  socket.on('online', function (user) {
    // Broadcast the current number of people online in the room
    io.to(socket.roomNum).emit("clientNum", count[socket.roomNum])
    socket.username = user
    // Broadcast messages to all clients in the current room (not including the current socket itself)
    socket.broadcast.in(socket.roomNum).emit("online", user)

    console.log('user : ' + socket.username + 'online!')
  })

  // Receive messages sent by users
  socket.on('msg', function (data) {
    console.log("msg enter")
    // Broadcast the received message (including sent to the current socket)
    io.to(socket.roomNum).emit("broadcastMsg", data)
  })

  // Receive private chat information
  // socket.on('privateMsg', function (data) {
  //   console.log(data)
  // })

  // Receive user disconnect information
  socket.on('offline', function (user) {
    count[socket.roomNum]--;
    // Broadcast the current number of people online in the room
    io.to(socket.roomNum).emit("clientNum", count[socket.roomNum])
    // Broadcast user disconnected and offline
    socket.broadcast.in(socket.roomNum).emit("offline", user);
    socket.leave(socket.roomNum);
    console.log("user : " + user + ' going offline~')
  })                  

  // Monitor user disconnection
  socket.on('disconnect', function () {
    // The current socket leaves the room
    socket.leave(socket.roomNum);
    // The current number of people in the room minus 1
    count[socket.roomNum]--;
    // Broadcast the current number of people online in the room
    io.to(socket.roomNum).emit("clientNum", count[socket.roomNum])
    // Broadcast user disconnected and offline
    socket.broadcast.in(socket.roomNum).emit("offline", socket.username);
    console.log("user : " + socket.username + ' going offline~')
  })
})

// routing interface
router.post("/doRegister", (req, res, next) => {
  // parse the file, use the package
  var form = new formidable.IncomingForm()
  // Modify upload directory
  form.uploadDir = path.join(__dirname, 'public', 'imgs');
  // Set the encoding format
  form.encoding = 'utf-8';
  // Keep the original file extension
  form.keepExtensions = true;
  // parse
  form.parse(req, function (err, fields, files) {
    var username = fields.username;
    var password = fields.password;
    var avatar = ""
    console.log(files);
    if (JSON.stringify(files) !== "{}") {
      avatar = "http://localhost:8889/imgs/" + path.parse(files.avatar.path).base;
    } else {
      avatar = "http://images.lydiagogo.cn/chat_avatar.jpg"
    }
    // Determine whether the user name exists
    console.log(username, password, avatar)
    db.find("user", {
      username
    }, function (err, result) {
      if (err) return next(err);
      if (result.length) {
        res.json({
          code: 300,
          msg: "Username already exists!"
        })
      } else {
        // Encryption and salt
        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
          if (err) return next(err)
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) return next(err)
            password = hash
            // Save the data to the database
            db.insert("user", {
              username,
              password,
              avatar
            }, function (err, result) {
              if (err) return next(err)
              // save location cookie
              // res.setHeader('set-cookie', 'location=' + location);
              // Synchronous submission, the browser waits for the page to be displayed
              res.json({
                code: 200,
                msg: "registration success!"
              })
            })
          })
        })

      }
    })
  });
}).post("/doLogin", (req, res, next) => {
  // parse the file, use the package
  var form = new formidable.IncomingForm();
  // Set the encoding format
  form.encoding = 'utf-8';
  // parse
  form.parse(req, function (err, fields, files) {
    if (err) next(err)
    var username = fields.username;
    var password = fields.password;
    // Determine whether the username and password are correct
    db.find("user", {
      username
    }, function (err, result) {
      if (err) {
        res.json({
          code: 500,
          msg: "Database error"
        })
      } else if (result.length == 0) {
        res.json({
          code: 400,
          msg: "this user does not exist"
        })
      } else {
        bcrypt.compare(password, result[0].password, (err, isMatch) => {
          if (err) {
            res.json({
              code: 500,
              msg: "database error!"
            })
          } else if (isMatch) {
            res.json({
              code: 200,
              msg: "Successful landing!"
            })
          } else {
            res.json({
              code: 400,
              msg: "wrong password!"
            })
          }
        })
      }
    })
  });
}).get("/getAvatar", (req, res, next) => {
  var {
    username
  } = req.query;
  db.find("user", {
    username
  }, function (err, result) {
    if (err) next(err)
    if (result.length == 1) {
      console.log("1")
      res.json({
        code: 200,
        msg: result[0].avatar
      })
    } else {
      console.log("0")
      res.json({
        code: 300,
        msg: "Not found!"
      })
    }
  })
}).get("/getRooms", (req, res, next) => {
  db.find("rooms", {}, function (err, result) {
    if (err) next(err)
    // if (result.length >= 10) {
    //   res.json({
    //     code: 300,
    //     msg: "Too many rooms, more than ten, failed to add room"
    //   })
    // } else {
    res.json({
      code: 200,
      msg: result
    })
    // }
  })
}).post("/addRoom", (req, res, next) => {
  // parse the file, use the package
  var form = new formidable.IncomingForm()
  // Modify upload directory
  form.uploadDir = path.join(__dirname, 'public', 'roomBgImg');
  // Set the encoding format
  form.encoding = 'utf-8';
  // Keep the original file extension
  form.keepExtensions = true;
  // parse
  form.parse(req, function (err, fields, files) {
    var roomName = fields.roomName;
    var roomNum = fields.roomNum;
    var bgImg = ""
    if (JSON.stringify(files) !== "{}") {
      console.log("{}")
      bgImg = "http://localhost:8889/roomBgImg/" + path.parse(files.bgImg.path).base;
    }
    // Save the data to the database
    db.insert("rooms", {
      roomName,
      roomNum,
      bgImg
    }, function (err, result) {
      if (err) return next(err)
      // save location cookie
      // res.setHeader('set-cookie', 'location=' + location);
      // Synchronous submission, the browser waits for the page to be displayed
      res.json({
        code: 200,
        msg: "Added successfully!"
      })
    });
  })
}).get("/getRoomName", (req, res, next) => {
  var {
    roomNum
  } = req.query;
  db.find("rooms", {
    roomNum: roomNum.toString()
  }, function (err, result) {
    if (err) next(err)
    res.json({
      code: 200,
      msg: result
    })
  })
}).post("/modifyInfo", (req, res, next) => {
  // parse the file, use the package
  var form = new formidable.IncomingForm()
  // Modify upload directory
  form.uploadDir = path.join(__dirname, 'public', 'imgs');
  // Set the encoding format
  form.encoding = 'utf-8';
  // Keep the original file extension
  form.keepExtensions = true;
  // parse
  form.parse(req, function (err, fields, files) {
    var user = fields.user;
    var username = fields.username;
    var oldPassword = fields.oldPassword;
    var password = fields.newPassword;
    var avatar = fields.avatar;
    if (JSON.stringify(files) !== "{}") {
      avatar = "http://localhost:8889/imgs/" + path.parse(files.avatar.path).base;
    }
    db.find("user", {
      username: user
    }, function (err, result) {
      if (err) return next(err)
      bcrypt.compare(oldPassword, result[0].password, (err, isMatch) => {
        if (err) return next(err)
        if (isMatch) {
          // Encrypt and salt the new password
          bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
            if (err) return next(err)
            bcrypt.hash(password, salt, (err, hash) => {
              if (err) return next(err)
              password = hash
              // Update data to the database
              db.update("user", {
                username: user
              }, {
                username,
                password,
                avatar
              }, function (err, result) {
                if (err) return next(err)
                // save location cookie
                // res.setHeader('set-cookie', 'location=' + location);
                // Synchronous submission, the browser waits for the page to be displayed
                console.log(result)
                if(result.result.ok == 1){
                  res.json({
                    code: 200,
                    msg: "Successfully modified!"
                  })
                }
              });
            })
          })

        } else {
          res.json({
            code: 400,
            msg: "wrong password!"
          })
        }
      })
    })
  })
})


// Process the path of static files (pictures)
app.use(express.static(path.join(__dirname, '/public')));

// Add the routing middleware to the app server
app.use(router);