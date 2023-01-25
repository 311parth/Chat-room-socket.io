
const socket = io();
// console.log("jh")
// console.log(socket)
socket.on("connect",()=>{
    // console.log(socket)
    console.log(socket.id)
    // console.log(socket.connected)
})

var inputUsername = document.getElementById("input-username")
var username ;
inputUsername && inputUsername.addEventListener("change",()=>{
    username = inputUsername.value;
    sessionStorage.setItem("username", inputUsername.value);
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
    newRoomBtn.addEventListener("click",async()=>{
        if(inputUsername.value===""){
            alert("enter username")
            return;
        }
        //TODO: use jwt to varify the username

        // localStorage.setItem("username", inputUsername.value);
        
        const usernameTokenPromise = new Promise(function(myResolve, myReject) {
            socket.emit("getAuth",{username:username})
            socket.on("resAuth",(args)=>{
                // console.log(args);
                sessionStorage.setItem("usernameToken",args)
                myResolve();
            })
        });
            
        
        usernameTokenPromise.then(()=>{
            const sessionUsername=sessionStorage.getItem("username");
            const sessionUsernameToken = sessionStorage.getItem("usernameToken");
                socket.emit("verifyToken",{
                    username:sessionUsername,
                    usernameToken : sessionUsernameToken
                });
                socket.on("isAuth",(args)=>{
                    if(args){
                        console.log("fine")
                    }else{
                        alert("username session is corrupted")
                    }
                })
                socket.on("resVerifyToken",(args)=>{
                    // console.log(args);
                    sessionStorage.setItem("username",args.username)
                })
            socket.emit("getNewRoom","");//to create new room 
            socket.on("redirectionToNewRoom",(args)=>{ //it will return room url for new room
                // console.log(args)
                window.location.pathname=args;
        })
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
const newRightMsgBox = (msgData,typeClass)=> `<div class="msgBox ${typeClass}">
<span class="userLable">${msgData.username}</span>
<div class="msgBody">
    <p>${msgData.msg}</p>
</div>
</div>`

const submitMsg = document.getElementById("submit-msg")
submitMsg && submitMsg.addEventListener("click",()=>{
    // const usernameLocalStored = localStorage.getItem("username");
    const usernameLocalStored = sessionStorage.getItem("username");
    const currentRoomId = window.location.pathname.toString().substr(-6,6);
    const textMsgInput = document.getElementById("text-msg-input");
    // console.log(textMsgInput)
    var flagCorrept=0;
    socket.emit("send-msg",{username:usernameLocalStored,msg:textMsgInput.value,roomid:currentRoomId,usernameToken:sessionStorage.getItem("usernameToken")})
    socket.on("corrupt-username",(args)=>{
        flagCorrept=1;
        alert(args);
        window.location = "/";
    })
    if(!flagCorrept){
        const msgData = {
            username:usernameLocalStored,
            msg:textMsgInput.value
        }
        if(msgContainer) msgContainer.innerHTML+=newRightMsgBox(msgData,"rightMsgBox")
    }
    msgContainer.scrollTop = msgContainer.scrollHeight;//to auto scroll-down
    textMsgInput.value="";//to clear input
    textMsgInput.focus();//to auto focus on input after submit 
})

socket.on("newMsg",(args)=>{
    // console.log(args)
    if(msgContainer) msgContainer.innerHTML+=newRightMsgBox(args,"leftMsgBox")
    msgContainer.scrollTop = msgContainer.scrollHeight;//to auto scroll-down
})

