
const socket = io();
// console.log("jh")
// console.log(socket)
socket.on("connect",()=>{
    console.log(socket)
    // console.log(socket.id)
    // console.log(socket.connected)
})

var inputUsername = document.getElementById("input-username")
var username ;
inputUsername && inputUsername.addEventListener("change",()=>{
    username = inputUsername.value;
    // console.log("us :",inputUsername.value,typeof(username))
})




const uid = window.location.pathname.toString().substr(-6,6);

const idTextElement = document.getElementById("id-text");
if(idTextElement)idTextElement.innerText= uid

const msgContainer = document.querySelector(".msgContainer")
const newJoinedMsg = (newJoinedUsername) => `<div class="newJoinedMsg">
<div class="msgBody">
    <p>New user joined : <span id="new-joined-msg-username"> ${newJoinedUsername}</span></p>
</div>
</div>`;
socket.on("newJoined",(args)=>{
    if(msgContainer) msgContainer.innerHTML+=newJoinedMsg(args)
    // console.log("new user joined",args)
})

// if(window.location.pathname)
if(window.location.pathname!=="/"){
    socket.emit("join-room",uid)
}
 
const copyBtn = document.querySelector(".copy-btn");
if(copyBtn){
    copyBtn.addEventListener("click",()=>{
        navigator.clipboard.writeText(uid);
        copyBtn.innerText = "copied"
    })
}
const newRoomBtn = document.getElementById("new-room-btn");
if(newRoomBtn){
    newRoomBtn.addEventListener("click",()=>{
        if(inputUsername.value===""){
            alert("enter username")
            return;
        }
        socket.emit("getNewRoom","");//to create new room 
        socket.on("redirectionToNewRoom",(args)=>{ //it will return room url for new room
            // console.log(args)
            window.location.pathname=args;   
        })
    })
}



const joinRoomBtn = document.getElementById("join-room-btn");
if(joinRoomBtn){
    joinRoomBtn.addEventListener("click",()=>{
        const inputedId = document.getElementById("input-join-id").value;
        socket.emit("joinRoomReq",{reqid : inputedId,username : username})
        socket.on("joinRoomReqResponse",(resRoomReq)=>{
            // console.log(resRoomReq)
            if(resRoomReq.success){
                window.location = `http://localhost:3000/room/id/${resRoomReq.roomid}`
            }
        })
    })
}

// socket.on("redirectionToNewRoom",(args)=>{
//     console.log(args)
// })

