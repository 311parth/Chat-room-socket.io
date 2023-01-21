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
    // const uid = randomId(6);
    // if(currentRunningId.includes(uid)){
    //     console.log("yes")
    // }else
    // {
    //     currentRunningId.push(uid)
    //     console.log("no")
    // }
    // console.log(currentRunningId)
    
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
// console.log(getUid())
app.get("/newroom",(req,res)=>{
    const uid= getUid();
    // console.log(uid)
    // console.log(currentRunningId)

    res.redirect(`/room/id/${uid}`)
})


app.get("/room/id/:id",(req,res)=>{
    if(currentRunningId.includes(req.params.id)){
        res.sendFile(__dirname+"/public/room.html")
    }else{
        res.sendStatus(404)
    }
})

app.post("/redirect/chatroom",(req,res)=>{
    // console.log(currentRunningId)
    const newJoinedUsername = req.body.username;
    const roomId = req.body.roomid;
    if(currentRunningId.includes(roomId)){
        io.on("connection",(socket)=>{
            // console.log("connected",socket.id)
            socket.broadcast.emit("newJoined",newJoinedUsername)
        })
        res.json({"isok":1})
        
    }else{
        res.json({"isok":0});
    }
})
const io = require("socket.io")(httpServer)

io.on("connection",(socket)=>{
    console.log("connected",socket.id)
})