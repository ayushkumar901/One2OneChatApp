const express = require('express')
const app = express();
const path = require('path');

const http = require('http');
const server = http.createServer(app);
const socketIo = require('socket.io');
// const { Socket } = require('engine.io');
const io = socketIo(server);
const { v4: uuidv4 } = require('uuid');

let waitingusers = [];

io.on('connection',(socket)=>{
    console.log('User Connected');
    // console.log(waitingusers.length);

    socket.on('joinroom',(username)=>{
        socket.username = username;
        if(waitingusers.length == 0){
            waitingusers.push(socket);
            // console.log(waitingusers.length);
            return;
        }
        const roomid = uuidv4();
        // console.log(roomid);
        const waitingUser = waitingusers.pop();
        const currentUser = socket;

        waitingUser.join(roomid);
        currentUser.join(roomid);

        io.to(roomid).emit('roomJoined', roomid);
    })

    socket.on('message',(messageObject)=>{
        const {message , room} = messageObject;
        // console.log(message)
        // console.log(room)
        socket.broadcast.to(room).emit('message',message)
    })
})


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));

app.get('/',(req,res)=>{
    res.render('index');
})

server.listen(3000);