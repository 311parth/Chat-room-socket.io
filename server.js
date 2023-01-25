const express = require("express")
const app = express();
const http = require("http")
const path = require("path")
const randomId = require("random-id")
const httpServer = http.createServer(app);
const PORT = 3000;
httpServer.listen(PORT,()=>{
    console.log("httpServer is running on ",PORT)
})
var jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
// get config vars
dotenv.config();

const bcrypt = require("bcrypt");
const salt = 9999;



var currentRunningId = ["1"];

app.use(express.static("public"))
app.use(express.json())
app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname, 'public'))
})
app.get("/room",(req,res)=>{
    res.sendFile(__dirname+"/public/room.html")
})

const getUid = ()=>{
    const uid = randomId(6);
    if(currentRunningId.includes(uid)){
        getUid();
    }else
    {
        currentRunningId.push(uid)
        return uid;
    }
}


app.get("/room/id/:id",(req,res)=>{
    if(currentRunningId.includes(req.params.id)){
        res.sendFile(__dirname+"/public/room.html")
    }else{
        res.sendStatus(404)
    }
})

const io = require("socket.io")(httpServer)

io.on("connection",(socket)=>{
    socket.on("join-room",id=>{
        if(currentRunningId.includes(id)){
            socket.join(id);
        }
    })
    console.log("connected",socket.id)

    //Auth for new room creator
    socket.on("getAuth",(args)=>{
        // console.log(args);
        const token = jwt.sign({ username: args.username }, process.env.TOKEN_SECRET, {
            expiresIn: "7d",
        });
        socket.emit("resAuth",token);
    })
    //TODO: make simple jwt 
    //to verify token
    socket.on("verifyToken",(args)=>{
        // console.log(args)
        const verify_jwt = jwt.verify(args.usernameToken, process.env.TOKEN_SECRET);
        if(verify_jwt.username===args.username){//if session variable of client : username and token is correct then only grant auth 
            socket.emit("isAuth",1)
            socket.emit("resVerifyToken",verify_jwt);
        }else{
            socket.emit("isAuth",0);
        }
    })

    socket.on("getNewRoom",()=>{
        const uid= getUid();
        socket.join(uid);
        socket.emit("redirectionToNewRoom",`/room/id/${uid}`)
    })
    socket.on("joinRoomReq",(req)=>{
        // console.log("join room req got ",req)
        if(currentRunningId.includes(req.reqid)){
            socket.join(req.reqid)
            // console.log("to",io.sockets.adapter.rooms.has(req.reqid))
            io.sockets.in(req.reqid).emit('newJoined', req.username);

            socket.emit("joinRoomReqResponse",{success:1,roomid:req.reqid})
        }else{
            socket.emit("joinRoomReqResponse",{success:0,roomid:req.reqid})
        }
    })

    socket.on("send-msg",(args)=>{
        // console.log(args)
        const verify_jwt = jwt.verify(args.usernameToken, process.env.TOKEN_SECRET);
        if(verify_jwt.username===args.username){//if session variable of client : username and token is correct then only grant auth 
            socket.broadcast.to(args.roomid).emit('newMsg', args);
        }else{
            socket.emit("corrupt-username","username is corrupted")
        }
        
    })

})



