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
        socket.broadcast.to(args.roomid).emit('newMsg', args);
    })

})
